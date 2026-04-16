const express = require("express");
const request = require("supertest");

jest.mock("../../models/Booking", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/Chat", () => {
  const Chat = jest.fn().mockImplementation((payload) => ({
    ...payload,
    save: jest.fn().mockResolvedValue(true),
  }));
  Chat.findOne = jest.fn();
  return Chat;
});

jest.mock("../../models/User", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../models/MechanicProfile", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

const Booking = require("../../models/Booking");
const Chat = require("../../models/Chat");
const mechanicRouter = require("../../routes/mechanic");

const buildIoMock = () => {
  const roomEmit = jest.fn();
  return {
    to: jest.fn(() => ({ emit: roomEmit })),
    emit: jest.fn(),
    createNotification: jest.fn().mockResolvedValue({ _id: "notif-1" }),
    _roomEmit: roomEmit,
  };
};

const createApp = (io) => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: "mechanic-1", name: "Mechanic Demo" };
    req.flash = jest.fn(() => []);
    next();
  });
  app.set("io", io);
  app.use("/mechanic", mechanicRouter);
  return app;
};

const buildBooking = (overrides = {}) => ({
  _id: "booking-1",
  user: "user-1",
  mechanic: "mechanic-1",
  status: "pending",
  payment: { amount: 0 },
  notes: "",
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("mechanic routes unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /booking/:id/accept returns 404 when booking is missing", async () => {
    Booking.findById.mockResolvedValue(null);
    const app = createApp(buildIoMock());

    const res = await request(app)
      .post("/mechanic/booking/booking-1/accept")
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test("POST /booking/:id/accept returns 400 for non-pending booking", async () => {
    Booking.findById.mockResolvedValue(buildBooking({ status: "accepted" }));
    const app = createApp(buildIoMock());

    const res = await request(app)
      .post("/mechanic/booking/booking-1/accept")
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pending state/i);
  });

  test("POST /booking/:id/accept updates booking, emits status, and creates notification", async () => {
    const booking = buildBooking({ mechanic: null, status: "pending" });
    Booking.findById.mockResolvedValue(booking);
    Chat.findOne.mockResolvedValue(null);

    const io = buildIoMock();
    const app = createApp(io);

    const res = await request(app)
      .post("/mechanic/booking/booking-1/accept")
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(booking.mechanic).toBe("mechanic-1");
    expect(booking.status).toBe("accepted");
    expect(booking.save).toHaveBeenCalledTimes(1);
    expect(Chat.findOne).toHaveBeenCalledWith({ booking: "booking-1" });
    expect(Chat).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalled();
    expect(io.createNotification).toHaveBeenCalledTimes(1);
  });

  test("POST /booking/:id/start returns 403 when mechanic is not assigned", async () => {
    Booking.findById.mockResolvedValue(
      buildBooking({ mechanic: { toString: () => "another-mechanic" }, status: "accepted" })
    );

    const app = createApp(buildIoMock());
    const res = await request(app)
      .post("/mechanic/booking/booking-1/start")
      .set("Accept", "application/json");

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test("POST /booking/:id/start moves accepted booking to in-progress", async () => {
    const booking = buildBooking({
      mechanic: { toString: () => "mechanic-1" },
      status: "accepted",
    });
    Booking.findById.mockResolvedValue(booking);

    const io = buildIoMock();
    const app = createApp(io);

    const res = await request(app)
      .post("/mechanic/booking/booking-1/start")
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(booking.status).toBe("in-progress");
    expect(booking.save).toHaveBeenCalledTimes(1);
    expect(io.createNotification).toHaveBeenCalledTimes(1);
  });

  test("POST /booking/:id/complete validates amount", async () => {
    const app = createApp(buildIoMock());

    const res = await request(app)
      .post("/mechanic/booking/booking-1/complete")
      .set("Accept", "application/json")
      .send({ notes: "done" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/service amount/i);
  });

  test("POST /booking/:id/complete marks booking as completed and updates payment", async () => {
    const booking = buildBooking({
      mechanic: { toString: () => "mechanic-1" },
      status: "in-progress",
      payment: { amount: 0 },
    });
    Booking.findById.mockResolvedValue(booking);

    const io = buildIoMock();
    const app = createApp(io);

    const res = await request(app)
      .post("/mechanic/booking/booking-1/complete")
      .set("Accept", "application/json")
      .send({ amount: "499.99", notes: "Completed successfully" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(booking.status).toBe("completed");
    expect(booking.payment.amount).toBeCloseTo(499.99, 2);
    expect(booking.notes).toBe("Completed successfully");
    expect(booking.save).toHaveBeenCalledTimes(1);
    expect(io.createNotification).toHaveBeenCalledTimes(1);
  });
});
