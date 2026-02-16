const User = require("../models/User");
const MechanicProfile = require("../models/MechanicProfile");
const Booking = require("../models/Booking");
const Subscription = require("../models/Subscription");
const Chat = require("../models/Chat");
const AppError = require("../utils/AppError");

// Get staff dashboard data
exports.getDashboardData = async (req, res, next) => {
  try {
    // Get counts for pending mechanic applications
    const pendingMechanicsCount = await User.countDocuments({
      role: "mechanic",
      isApproved: false,
    });

    // Get counts for bookings with disputes/conflicts
    const disputedBookingsCount = await Booking.countDocuments({
      "dispute.status": "pending",
    });

    // Get payment stats
    const completedPayments = await Booking.countDocuments({
      status: "completed",
      "payment.status": "completed",
    });

    const pendingPayments = await Booking.countDocuments({
      status: "completed",
      "payment.status": "pending",
    });

    // Calculate total revenue
    const bookingRevenue = await Booking.aggregate([
      { $match: { status: "completed", "payment.status": "completed" } },
      { $group: { _id: null, total: { $sum: "$payment.amount" } } },
    ]);

    const totalRevenue = bookingRevenue.length > 0 ? bookingRevenue[0].total : 0;

    // Get recent pending mechanic applications
    const pendingMechanics = await MechanicProfile.find({})
      .populate({
        path: "user",
        match: { isApproved: false, role: "mechanic" },
        select: "name email phone isApproved createdAt",
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter out null users (those who are already approved)
    const filteredPendingMechanics = pendingMechanics.filter(
      (m) => m.user !== null
    );

    // Get recent disputed bookings
    const disputedBookings = await Booking.find({
      "dispute.status": "pending",
    })
      .populate("user", "name email")
      .populate("mechanic", "name email")
      .sort({ "dispute.createdAt": -1 })
      .limit(10);

    // Get recent payments
    const recentPayments = await Booking.find({
      "payment.status": { $in: ["completed", "pending"] },
    })
      .populate("user", "name email")
      .populate("mechanic", "name email")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      dashboard: {
        pendingMechanicsCount,
        disputedBookingsCount,
        paymentStats: {
          completed: completedPayments,
          pending: pendingPayments,
          totalRevenue,
        },
        pendingMechanics: filteredPendingMechanics,
        disputedBookings,
        recentPayments,
      },
    });
  } catch (error) {
    console.error("Staff dashboard error:", error);
    next(new AppError("Failed to load staff dashboard", 500));
  }
};

// Get all pending mechanic applications
exports.getPendingMechanics = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({
      role: "mechanic",
      isApproved: false,
    }).sort({ createdAt: -1 });

    const pendingMechanics = await MechanicProfile.find({
      user: { $in: pendingUsers.map((u) => u._id) },
    }).populate("user", "name email phone createdAt");

    res.json({
      success: true,
      pendingMechanics,
    });
  } catch (error) {
    console.error("Get pending mechanics error:", error);
    next(new AppError("Failed to fetch pending mechanics", 500));
  }
};

// Get mechanic details for review
exports.getMechanicDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mechanic = await User.findById(id);
    if (!mechanic || mechanic.role !== "mechanic") {
      return next(new AppError("Mechanic not found", 404));
    }

    const profile = await MechanicProfile.findOne({ user: id });

    res.json({
      success: true,
      mechanic,
      profile,
    });
  } catch (error) {
    console.error("Get mechanic details error:", error);
    next(new AppError("Failed to fetch mechanic details", 500));
  }
};

// Approve mechanic application
exports.approveMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mechanic = await User.findById(id);
    if (!mechanic || mechanic.role !== "mechanic") {
      return next(new AppError("Mechanic not found", 404));
    }

    if (mechanic.isApproved) {
      return next(new AppError("Mechanic is already approved", 400));
    }

    mechanic.isApproved = true;
    await mechanic.save();

    res.json({
      success: true,
      message: "Mechanic approved successfully",
    });
  } catch (error) {
    console.error("Approve mechanic error:", error);
    next(new AppError("Failed to approve mechanic", 500));
  }
};

// Reject mechanic application
exports.rejectMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const mechanic = await User.findById(id);
    if (!mechanic || mechanic.role !== "mechanic") {
      return next(new AppError("Mechanic not found", 404));
    }

    // Delete mechanic profile
    await MechanicProfile.findOneAndDelete({ user: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Mechanic application rejected and removed",
    });
  } catch (error) {
    console.error("Reject mechanic error:", error);
    next(new AppError("Failed to reject mechanic", 500));
  }
};

// Get all disputed/conflict bookings
exports.getDisputedBookings = async (req, res, next) => {
  try {
    const disputedBookings = await Booking.find({
      "dispute.status": { $in: ["pending", "under-review"] },
    })
      .populate("user", "name email phone")
      .populate("mechanic", "name email phone")
      .sort({ "dispute.createdAt": -1 });

    res.json({
      success: true,
      disputedBookings,
    });
  } catch (error) {
    console.error("Get disputed bookings error:", error);
    next(new AppError("Failed to fetch disputed bookings", 500));
  }
};

// Get booking details for dispute resolution
exports.getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "name email phone location")
      .populate("mechanic", "name email phone");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Get chat history if exists
    const chat = await Chat.findOne({ booking: id });

    res.json({
      success: true,
      booking,
      chat,
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    next(new AppError("Failed to fetch booking details", 500));
  }
};

// Resolve a dispute
exports.resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution, refundAmount, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Update dispute status
    booking.dispute = {
      ...booking.dispute,
      status: "resolved",
      resolution,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      notes,
    };

    // Handle refund if applicable
    if (refundAmount && refundAmount > 0) {
      booking.payment.status = "refunded";
      booking.payment.refundAmount = refundAmount;
    }

    await booking.save();

    res.json({
      success: true,
      message: "Dispute resolved successfully",
      booking,
    });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    next(new AppError("Failed to resolve dispute", 500));
  }
};

// Get all payments with filters
exports.getPayments = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== "all") {
      query["payment.status"] = status;
    }

    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) {
        query.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.updatedAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Booking.find(query)
      .populate("user", "name email")
      .populate("mechanic", "name email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    // Get payment statistics
    const completedPayments = await Booking.countDocuments({
      "payment.status": "completed",
    });
    const pendingPayments = await Booking.countDocuments({
      "payment.status": "pending",
    });
    const refundedPayments = await Booking.countDocuments({
      "payment.status": "refunded",
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { "payment.status": "completed" } },
      { $group: { _id: null, total: { $sum: "$payment.amount" } } },
    ]);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: {
        completed: completedPayments,
        pending: pendingPayments,
        refunded: refundedPayments,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    next(new AppError("Failed to fetch payments", 500));
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "name email phone")
      .populate("mechanic", "name email phone");

    if (!booking) {
      return next(new AppError("Payment not found", 404));
    }

    res.json({
      success: true,
      payment: booking,
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    next(new AppError("Failed to fetch payment details", 500));
  }
};

// Change password for first-time login
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError("All fields are required", 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError("New passwords do not match", 400));
    }

    if (newPassword.length < 6) {
      return next(
        new AppError("Password must be at least 6 characters long", 400)
      );
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 400));
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    // Update session
    req.session.user.mustChangePassword = false;

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(new AppError("Failed to change password", 500));
  }
};

// Get all bookings for staff view
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate("user", "name email")
      .populate("mechanic", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    next(new AppError("Failed to fetch bookings", 500));
  }
};

// Report/flag a booking for dispute
exports.flagBookingDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.dispute = {
      status: "pending",
      reason,
      description,
      reportedBy: req.user._id,
      createdAt: new Date(),
    };

    await booking.save();

    res.json({
      success: true,
      message: "Booking flagged for dispute review",
      booking,
    });
  } catch (error) {
    console.error("Flag booking dispute error:", error);
    next(new AppError("Failed to flag booking", 500));
  }
};
