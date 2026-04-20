const AppError = require("../../utils/AppError");

describe("AppError exhaustive unit tests", () => {
  describe("constructor status mapping", () => {
    const statuses = [
      ...Array.from({ length: 20 }, (_, i) => 100 + i * 5),
      ...Array.from({ length: 20 }, (_, i) => 200 + i * 5),
      ...Array.from({ length: 20 }, (_, i) => 300 + i * 5),
      ...Array.from({ length: 20 }, (_, i) => 400 + i * 5),
      ...Array.from({ length: 20 }, (_, i) => 500 + i * 5),
    ];

    test.each(statuses)("status code %i maps correctly", (statusCode) => {
      const err = new AppError("x", statusCode);
      const expected = String(statusCode).startsWith("4") ? "fail" : "error";

      expect(err.statusCode).toBe(statusCode);
      expect(err.status).toBe(expected);
      expect(err.isOperational).toBe(true);
    });
  });

  describe("input validation errors", () => {
    const badMessages = [null, 123, {}, [], true, false];
    const badCodes = [-1, 0, 99, 600, 999, 100.5, "400", null];

    test.each(badMessages)("invalid message %p throws", (msg) => {
      if (typeof msg === "string") return;
      expect(() => new AppError(msg, 400)).toThrow(/message must be a string/i);
    });

    test.each(badCodes)("invalid statusCode %p throws", (code) => {
      expect(() => new AppError("ok", code)).toThrow(/status code must be an integer/i);
    });
  });

  describe("toJSON behavior", () => {
    const prodModes = [true, false];
    const dataCases = [
      null,
      { f: 1 },
      { nested: { a: 1 } },
      [1, 2, 3],
    ];

    test.each(prodModes)("toJSON production=%p controls stack", (prod) => {
      const err = new AppError("serialize", 500, { code: "E_SER" });
      const json = err.toJSON(prod);

      if (prod) {
        expect(json.stack).toBeUndefined();
      } else {
        expect(typeof json.stack).toBe("string");
      }
    });

    test.each(dataCases)("toJSON includes data %p when provided", (data) => {
      const err = new AppError("with-data", 400, { data, code: "D" });
      const json = err.toJSON(true);

      if (data) {
        expect(json.data).toEqual(data);
      } else {
        expect(json.data).toBeUndefined();
      }
      expect(json.code).toBe("D");
    });

    test("toJSON includes nested cause in non-production", () => {
      const cause = {
        toJSON: () => ({ message: "inner" }),
      };
      const err = new AppError("outer", 500, { cause, code: "OUTER" });
      const json = err.toJSON(false);

      expect(json.cause).toBeDefined();
      expect(json.message).toBe("outer");
    });
  });

  describe("static factories", () => {
    const factories = [
      { name: "badRequest", fn: AppError.badRequest, code: 400, status: "fail" },
      { name: "unauthorized", fn: AppError.unauthorized, code: 401, status: "fail" },
      { name: "notFound", fn: AppError.notFound, code: 404, status: "fail" },
      { name: "internalServerError", fn: AppError.internalServerError, code: 500, status: "error" },
    ];

    test.each(factories)("$name returns expected code/status", ({ fn, code, status }) => {
      const err = fn("factory message", { code: "X", data: { ok: true } });
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(code);
      expect(err.status).toBe(status);
      expect(err.code).toBe("X");
      expect(err.data).toEqual({ ok: true });
    });
  });

  describe("bulk deterministic factory checks", () => {
    const generated = Array.from({ length: 80 }, (_, i) => ({
      i,
      mode: i % 4,
      message: `message-${i}`,
      data: { idx: i },
    }));

    test.each(generated)("generated case #%#", ({ mode, message, data }) => {
      let err;
      if (mode === 0) err = AppError.badRequest(message, { data, code: "B" });
      if (mode === 1) err = AppError.unauthorized(message, { data, code: "U" });
      if (mode === 2) err = AppError.notFound(message, { data, code: "N" });
      if (mode === 3) err = AppError.internalServerError(message, { data, code: "I" });

      expect(err.message).toBe(message);
      expect(err.data).toEqual(data);
      expect(err.isOperational).toBe(true);
      expect(typeof err.stack).toBe("string");
    });
  });
});
