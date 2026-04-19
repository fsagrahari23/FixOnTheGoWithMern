const AppError = require("../../utils/AppError");

describe("AppError unit tests", () => {
  test("constructs expected fail status for 4xx errors", () => {
    const error = new AppError("Bad request", 400, { code: "BAD_INPUT", data: { field: "email" } });

    expect(error.message).toBe("Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe("fail");
    expect(error.isOperational).toBe(true);
    expect(error.code).toBe("BAD_INPUT");
    expect(error.data).toEqual({ field: "email" });
  });

  test("throws for invalid constructor inputs", () => {
    expect(() => new AppError(123, 400)).toThrow(/Message must be a string/);
    expect(() => new AppError("ok", 99)).toThrow(/Status code must be an integer between 100 and 599/);
  });

  test("toJSON hides stack in production and includes stack in non-production", () => {
    const error = AppError.notFound("Not found");

    const production = error.toJSON(true);
    expect(production.stack).toBeUndefined();
    expect(production.message).toBe("Not found");

    const development = error.toJSON(false);
    expect(typeof development.stack).toBe("string");
    expect(development.message).toBe("Not found");
  });

  test("static helpers use expected status codes", () => {
    expect(AppError.badRequest("bad").statusCode).toBe(400);
    expect(AppError.unauthorized("unauth").statusCode).toBe(401);
    expect(AppError.notFound("missing").statusCode).toBe(404);
    expect(AppError.internalServerError("oops").statusCode).toBe(500);
  });
});