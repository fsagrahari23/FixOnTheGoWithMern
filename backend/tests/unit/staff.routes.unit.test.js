const express = require("express");
const request = require("supertest");

jest.mock("../../controllers/staffController", () => ({
  changePassword: (req, res) => res.json({ success: true }),
  getDashboardData: (req, res) => res.json({ success: true }),
  getAnalyticsData: (req, res) => res.json({ success: true }),
  getPendingMechanics: jest.fn(),
  getMechanicDetails: jest.fn(),
  approveMechanic: jest.fn(),
  rejectMechanic: jest.fn(),
  getPendingCertificationRequests: jest.fn(),
  approveCertification: jest.fn(),
  rejectCertification: jest.fn(),
  getDisputedBookings: jest.fn(),
  getBookingDetails: jest.fn(),
  resolveDispute: jest.fn(),
  flagBookingDispute: jest.fn(),
  getAllBookings: jest.fn(),
  getPayments: jest.fn(),
  getPaymentDetails: jest.fn(),
}));

jest.mock("../../middleware/auth", () => ({
  isStaff: (req, res, next) => next(),
  checkPasswordChange: (req, res, next) => next(),
}));

jest.mock("../../middleware/cache", () => () => (req, res, next) => next());

jest.mock("../../models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/GeneralChat", () => ({
  findById: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../models/Notification", () => ({
  createAndEmit: jest.fn(),
}));

jest.mock("../../services/emailService", () => ({
  sendSupportResponseToUser: jest.fn(),
}));

const GeneralChat = require("../../models/GeneralChat");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const staffRouter = require("../../routes/staff");

const buildIoMock = () => ({
  to: jest.fn(() => ({ emit: jest.fn() })),
});

const createApp = (io = buildIoMock()) => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: "staff-1", role: "staff", name: "Staff Demo" };
    req.flash = jest.fn(() => []);
    next();
  });
  app.set("io", io);
  app.use("/staff", staffRouter);
  return app;
};

describe("staff routes unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /chat/:chatId/send returns 400 when message is missing", async () => {
    const app = createApp();
    const res = await request(app).post("/staff/chat/chat-1/send").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/message is required/i);
  });

  test("POST /chat/:chatId/send returns 404 when chat is missing", async () => {
    GeneralChat.findById.mockResolvedValue(null);
    const app = createApp();

    const res = await request(app)
      .post("/staff/chat/chat-1/send")
      .send({ message: "hello" });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/chat not found/i);
  });

  test("POST /chat/:chatId/send returns 403 for non-participant staff", async () => {
    GeneralChat.findById.mockResolvedValue({
      participants: ["user-1"],
    });
    const app = createApp();

    const res = await request(app)
      .post("/staff/chat/chat-1/send")
      .send({ message: "hello" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test("POST /chat/:chatId/send sends message and emits notification", async () => {
    const chat = {
      _id: "chat-1",
      participants: ["staff-1", "user-1"],
      messages: [],
      save: jest.fn().mockResolvedValue(true),
    };

    GeneralChat.findById.mockResolvedValue(chat);
    User.findById.mockResolvedValue({ _id: "user-1", name: "User Demo" });
    Notification.createAndEmit.mockResolvedValue({ _id: "notif-1" });

    const app = createApp();
    const res = await request(app)
      .post("/staff/chat/chat-1/send")
      .send({ message: "Support update" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(chat.save).toHaveBeenCalledTimes(1);
    expect(Notification.createAndEmit).toHaveBeenCalledTimes(1);
  });
});
