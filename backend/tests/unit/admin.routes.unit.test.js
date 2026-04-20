const express = require("express");
const request = require("supertest");

jest.mock("../../middleware/auth", () => ({
  isAdmin: (req, res, next) => next(),
}));

jest.mock("../../models/User", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/MechanicProfile", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/Subscription", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/Booking", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../models/Chat", () => ({}));

jest.mock("../../services/analyticsService", () => ({
  getUserAnalytics: jest.fn(),
  getMechanicAnalytics: jest.fn(),
}));

const User = require("../../models/User");
const MechanicProfile = require("../../models/MechanicProfile");
const Subscription = require("../../models/Subscription");
const Booking = require("../../models/Booking");
const analyticsService = require("../../services/analyticsService");
const adminRouter = require("../../routes/admin");

const createBookingQueryMock = (result) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: "admin-1", role: "admin", name: "Admin" };
    req.flash = jest.fn(() => []);
    next();
  });
  app.use("/admin", adminRouter);
  return app;
};

describe("admin routes unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/analytics/user/search returns 400 when email is missing", async () => {
    const app = createApp();
    const res = await request(app).get("/admin/api/analytics/user/search");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email is required/i);
  });

  test("GET /api/analytics/user/search returns 404 when user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const app = createApp();

    const res = await request(app).get("/admin/api/analytics/user/search?email=missing@test.com");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/user not found/i);
  });

  test("GET /api/analytics/user/search returns analytics payload", async () => {
    const user = {
      _id: "user-1",
      name: "User Demo",
      email: "user@test.com",
      phone: "9999999999",
      isPremium: true,
      createdAt: new Date("2026-01-01"),
      avatar: "",
    };

    User.findOne.mockResolvedValue(user);
    analyticsService.getUserAnalytics.mockResolvedValue({ totals: { bookings: 3 } });
    Subscription.findOne.mockResolvedValue({
      plan: "monthly",
      amount: 9.99,
      status: "active",
      startDate: new Date("2026-01-01"),
      expiresAt: new Date("2026-12-01"),
    });
    Booking.find.mockReturnValue(createBookingQueryMock([]));

    const app = createApp();
    const res = await request(app).get("/admin/api/analytics/user/search?email=user@test.com");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("user@test.com");
    expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith("user-1");
  });

  test("GET /api/analytics/mechanic/search returns mechanic analytics payload", async () => {
    const mechanic = {
      _id: "mechanic-1",
      name: "Mech Demo",
      email: "mech@test.com",
      phone: "8888888888",
      isApproved: true,
      createdAt: new Date("2026-01-01"),
      avatar: "",
    };

    User.findOne.mockResolvedValue(mechanic);
    MechanicProfile.findOne.mockResolvedValue({ rating: 4.8, totalReviews: 10 });
    analyticsService.getMechanicAnalytics.mockResolvedValue({ performance: { totalEarnings: 1000 } });
    Booking.countDocuments
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    Booking.find.mockReturnValue(createBookingQueryMock([]));

    const app = createApp();
    const res = await request(app).get("/admin/api/analytics/mechanic/search?email=mech@test.com");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mechanic.email).toBe("mech@test.com");
    expect(analyticsService.getMechanicAnalytics).toHaveBeenCalledWith("mechanic-1");
  });
});
