const MechanicProfile = require("../models/MechanicProfile");
const Booking = require("../models/Booking");
const Chat = require("../models/Chat");
const analyticsService = require("../services/analyticsService");

/**
 * Resolver functions for the Mechanic GraphQL API.
 * These reuse the same model/service logic as the REST endpoints.
 */

const getDashboard = async (context) => {
  const { user, flash } = context;

  const profile = await MechanicProfile.findOne({ user: user._id });
  const bookings = await Booking.find({ mechanic: user._id })
    .populate("user", "name phone")
    .sort({ createdAt: -1 });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    inProgress: bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const completedBookings = bookings.filter(
    (b) => b.status === "completed" && b.payment && b.payment.status === "completed"
  );
  const totalEarnings = completedBookings.reduce(
    (sum, booking) => sum + (booking.payment?.amount || 0),
    0
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBookings = completedBookings.filter(
    (b) => new Date(b.updatedAt) >= today
  );
  const todayEarnings = todayBookings.reduce(
    (sum, booking) => sum + (booking.payment?.amount || 0),
    0
  );

  let nearbyBookings = [];
  let userRequestedJob = [];

  if (user.location && user.location.coordinates) {
    nearbyBookings = await Booking.find({
      status: "pending",
      mechanic: null,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: user.location.coordinates,
          },
          $maxDistance: 10000,
        },
      },
    })
      .populate("user", "name")
      .limit(5);

    userRequestedJob = await Booking.find({
      mechanic: user._id,
      status: "pending",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: user.location.coordinates,
          },
          $maxDistance: 10000,
        },
      },
    }).populate("user", "name");
  }

  return {
    title: "Mechanic Dashboard",
    profile,
    bookings,
    stats,
    totalEarnings,
    todayEarnings,
    nearbyBookings,
    userRequestedJob,
    flash,
  };
};

const getBookingDetail = async (bookingId, context) => {
  const { user, flash } = context;

  const booking = await Booking.findById(bookingId)
    .populate("user", "name phone address")
    .populate("mechanic", "name phone");

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (
    booking.mechanic &&
    booking.mechanic._id.toString() !== user._id.toString()
  ) {
    throw new Error("Not authorized");
  }

  const chat = await Chat.findOne({ booking: booking._id });
  const profile = await MechanicProfile.findOne({ user: user._id });

  return { booking, chat, profile, flash };
};

const getHistory = async (context) => {
  const { user, flash } = context;

  const bookings = await Booking.find({ mechanic: user._id })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  const profile = await MechanicProfile.findOne({ user: user._id });

  return { bookings, profile, flash };
};

const getProfile = async (context) => {
  const { user, flash } = context;

  const profile = await MechanicProfile.findOne({ user: user._id });
  return { profile, flash };
};

const getAnalytics = async (context) => {
  const { user } = context;
  return analyticsService.getMechanicAnalytics(user._id);
};

module.exports = {
  getDashboard,
  getBookingDetail,
  getHistory,
  getProfile,
  getAnalytics,
};
