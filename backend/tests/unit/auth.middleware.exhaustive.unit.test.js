const {
  isAuthenticated,
  isUser,
  isMechanic,
  isAdmin,
  isStaff,
  isAdminOrStaff,
  checkPasswordChange,
} = require("../../middleware/auth");

const createRes = () => {
  const res = {};
  res.statusCode = 200;
  res.payload = undefined;
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res.payload = payload;
    return res;
  });
  return res;
};

const roleCases = [
  { role: "user", isApproved: true },
  { role: "mechanic", isApproved: true },
  { role: "mechanic", isApproved: false },
  { role: "admin", isApproved: true },
  { role: "staff", isApproved: true },
  { role: "guest", isApproved: true },
  { role: undefined, isApproved: true },
  { role: null, isApproved: true },
];

describe("auth middleware exhaustive unit tests", () => {
  describe("isAuthenticated matrix", () => {
    const authMatrix = [
      { label: "empty session", req: { session: {} }, allowed: false },
      { label: "null user", req: { session: { user: null } }, allowed: false },
      { label: "undefined user", req: { session: { user: undefined } }, allowed: false },
      {
        label: "user present",
        req: { session: { user: { _id: "u1", role: "user" } } },
        allowed: true,
      },
      {
        label: "admin present",
        req: { session: { user: { _id: "a1", role: "admin" } } },
        allowed: true,
      },
      {
        label: "staff present",
        req: { session: { user: { _id: "s1", role: "staff" } } },
        allowed: true,
      },
      {
        label: "mechanic present",
        req: { session: { user: { _id: "m1", role: "mechanic", isApproved: false } } },
        allowed: true,
      },
    ];

    test.each(authMatrix)("isAuthenticated: $label", ({ req, allowed }) => {
      const res = createRes();
      const next = jest.fn();

      isAuthenticated(req, res, next);

      if (allowed) {
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
      } else {
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
      }
    });
  });

  describe("role middleware matrix", () => {
    const middlewares = [
      { name: "isUser", fn: isUser, allow: (u) => u.role === "user", code: 403 },
      { name: "isAdmin", fn: isAdmin, allow: (u) => u.role === "admin", code: 403 },
      { name: "isStaff", fn: isStaff, allow: (u) => u.role === "staff", code: 403 },
      {
        name: "isAdminOrStaff",
        fn: isAdminOrStaff,
        allow: (u) => u.role === "admin" || u.role === "staff",
        code: 403,
      },
    ];

    middlewares.forEach((mw) => {
      roleCases.forEach((rc, index) => {
        test(`${mw.name} role case #${index + 1} (${String(rc.role)})`, () => {
          const req = { session: { user: { ...rc } } };
          const res = createRes();
          const next = jest.fn();

          mw.fn(req, res, next);

          if (mw.allow(rc)) {
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.user).toEqual(req.session.user);
            expect(res.status).not.toHaveBeenCalled();
          } else {
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(mw.code);
          }
        });
      });
    });
  });

  describe("isMechanic matrix", () => {
    const mechanicCases = [
      { user: undefined, allowed: false, code: 403 },
      { user: null, allowed: false, code: 403 },
      { user: { role: "user" }, allowed: false, code: 403 },
      { user: { role: "admin" }, allowed: false, code: 403 },
      { user: { role: "staff" }, allowed: false, code: 403 },
      { user: { role: "mechanic", isApproved: false }, allowed: false, code: 403 },
      { user: { role: "mechanic", isApproved: null }, allowed: false, code: 403 },
      { user: { role: "mechanic", isApproved: undefined }, allowed: false, code: 403 },
      { user: { role: "mechanic", isApproved: true }, allowed: true },
      { user: { role: "mechanic", isApproved: 1 }, allowed: true },
    ];

    test.each(mechanicCases)(
      "isMechanic case %#",
      ({ user, allowed, code }) => {
        const req = { session: { user } };
        const res = createRes();
        const next = jest.fn();

        isMechanic(req, res, next);

        if (allowed) {
          expect(next).toHaveBeenCalledTimes(1);
          expect(res.status).not.toHaveBeenCalled();
        } else {
          expect(next).not.toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(code);
        }
      }
    );
  });

  describe("checkPasswordChange matrix", () => {
    const cases = [
      { user: undefined, allowed: true },
      { user: null, allowed: true },
      { user: { mustChangePassword: false }, allowed: true },
      { user: { mustChangePassword: 0 }, allowed: true },
      { user: { mustChangePassword: null }, allowed: true },
      { user: { mustChangePassword: undefined }, allowed: true },
      { user: { mustChangePassword: true }, allowed: false },
      { user: { mustChangePassword: 1 }, allowed: false },
    ];

    test.each(cases)("checkPasswordChange case %#", ({ user, allowed }) => {
      const req = { session: { user } };
      const res = createRes();
      const next = jest.fn();

      checkPasswordChange(req, res, next);

      if (allowed) {
        expect(next).toHaveBeenCalledTimes(1);
      } else {
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.payload.mustChangePassword).toBe(true);
      }
    });
  });

  describe("stress-style deterministic checks", () => {
    const generated = Array.from({ length: 80 }).map((_, i) => ({
      i,
      role: i % 5 === 0 ? "admin" : i % 5 === 1 ? "staff" : i % 5 === 2 ? "user" : i % 5 === 3 ? "mechanic" : "guest",
      approved: i % 2 === 0,
    }));

    test.each(generated)("generated role check #%#", ({ role, approved }) => {
      const req = { session: { user: { role, isApproved: approved } } };
      const res1 = createRes();
      const res2 = createRes();
      const next1 = jest.fn();
      const next2 = jest.fn();

      isAdminOrStaff(req, res1, next1);
      isMechanic(req, res2, next2);

      const shouldAdminOrStaff = role === "admin" || role === "staff";
      const shouldMechanic = role === "mechanic" && !!approved;

      expect(next1).toHaveBeenCalledTimes(shouldAdminOrStaff ? 1 : 0);
      expect(next2).toHaveBeenCalledTimes(shouldMechanic ? 1 : 0);
    });
  });
});
