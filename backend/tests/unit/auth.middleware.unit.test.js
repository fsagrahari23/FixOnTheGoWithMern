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

describe("auth middleware unit tests", () => {
  test("isAuthenticated allows request with session user", () => {
    const req = { session: { user: { _id: "u1", role: "user" } } };
    const res = createRes();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(req.session.user);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("isAuthenticated blocks request without session user", () => {
    const req = { session: {} };
    const res = createRes();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.payload.message).toMatch(/log in/i);
  });

  test("isMechanic blocks unapproved mechanic", () => {
    const req = {
      session: {
        user: { _id: "m1", role: "mechanic", isApproved: false },
      },
    };
    const res = createRes();
    const next = jest.fn();

    isMechanic(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.payload.message).toMatch(/pending approval/i);
  });

  test("isUser allows user role and blocks others", () => {
    const reqAllowed = { session: { user: { role: "user" } } };
    const resAllowed = createRes();
    const nextAllowed = jest.fn();

    isUser(reqAllowed, resAllowed, nextAllowed);
    expect(nextAllowed).toHaveBeenCalledTimes(1);

    const reqDenied = { session: { user: { role: "mechanic" } } };
    const resDenied = createRes();
    const nextDenied = jest.fn();

    isUser(reqDenied, resDenied, nextDenied);
    expect(nextDenied).not.toHaveBeenCalled();
    expect(resDenied.status).toHaveBeenCalledWith(403);
  });

  test("isAdmin, isStaff and isAdminOrStaff enforce role checks", () => {
    const adminReq = { session: { user: { role: "admin" } } };
    const staffReq = { session: { user: { role: "staff" } } };
    const userReq = { session: { user: { role: "user" } } };

    const adminRes = createRes();
    const staffRes = createRes();
    const userRes = createRes();

    const nextAdmin = jest.fn();
    const nextStaff = jest.fn();
    const nextUser = jest.fn();

    isAdmin(adminReq, adminRes, nextAdmin);
    isStaff(staffReq, staffRes, nextStaff);
    isAdminOrStaff(userReq, userRes, nextUser);

    expect(nextAdmin).toHaveBeenCalledTimes(1);
    expect(nextStaff).toHaveBeenCalledTimes(1);
    expect(nextUser).not.toHaveBeenCalled();
    expect(userRes.status).toHaveBeenCalledWith(403);
  });

  test("checkPasswordChange blocks when mustChangePassword is true", () => {
    const req = { session: { user: { mustChangePassword: true } } };
    const res = createRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.payload.mustChangePassword).toBe(true);
  });

  test("checkPasswordChange allows when no reset is required", () => {
    const req = { session: { user: { mustChangePassword: false } } };
    const res = createRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("isAdminOrStaff allows admin and staff", () => {
    const nextAdmin = jest.fn();
    const nextStaff = jest.fn();

    isAdminOrStaff({ session: { user: { role: "admin" } } }, createRes(), nextAdmin);
    isAdminOrStaff({ session: { user: { role: "staff" } } }, createRes(), nextStaff);

    expect(nextAdmin).toHaveBeenCalledTimes(1);
    expect(nextStaff).toHaveBeenCalledTimes(1);
  });
}
);