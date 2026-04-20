const express = require("express");
const request = require("supertest");

jest.mock("../../middleware/cache", () => () => (req, res, next) => next());

jest.mock("../../utils/cacheInvalidation", () => ({
  invalidateUserCache: jest.fn(),
  invalidateBookingCaches: jest.fn(),
  invalidateMechanicCache: jest.fn(),
}));

jest.mock("../../models/Subscription", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/Chat", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../models/GeneralChat", () => ({
  findById: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../models/User", () => ({
  findById: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock("../../models/Booking", () => ({
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock("../../models/MechanicProfile", () => ({
  findOne: jest.fn(),
}));

const Subscription = require("../../models/Subscription");
const GeneralChat = require("../../models/GeneralChat");
const userRouter = require("../../routes/user");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: "user-1", role: "user", isPremium: false, premiumTier: null };
    req.flash = jest.fn(() => []);
    next();
  });
  app.use("/user", userRouter);
  return app;
};

describe("user routes unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/premium returns subscription payload", async () => {
    Subscription.findOne.mockResolvedValue({ plan: "monthly", status: "active" });

    const app = createApp();
    const res = await request(app).get("/user/api/premium");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.subscription.plan).toBe("monthly");
  });

  test("POST /api/chat/:chatId/send returns 400 when message is missing", async () => {
    const app = createApp();
    const res = await request(app).post("/user/api/chat/chat-1/send").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/message is required/i);
  });

  test("POST /api/chat/:chatId/send returns 404 when general chat is missing", async () => {
    GeneralChat.findById.mockResolvedValue(null);

    const app = createApp();
    const res = await request(app)
      .post("/user/api/chat/chat-1/send")
      .send({ message: "Hello" });

    // Route prefix conflict can resolve to booking chat or general chat handlers;
    // both use the same not found message/status for missing chat id.
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
