const User = require("../models/User");
const MechanicProfile = require("../models/MechanicProfile");
const Booking = require("../models/Booking");
const Subscription = require("../models/Subscription");
const Chat = require("../models/Chat");
const AppError = require("../utils/AppError");
const { invalidateAdminCache, invalidateStaffCache, invalidateMechanicCache, invalidateBookingCaches } = require("../utils/cacheInvalidation");

const OPEN_DISPUTE_STATUSES = ["pending", "open", "under_review", "under-review"];

const sixMonthsAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  date.setHours(0, 0, 0, 0);
  return date;
};

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

// Get staff analytics data
exports.getAnalyticsData = async (req, res, next) => {
  try {
    const startDate = sixMonthsAgo();

    const [
      totalBookings,
      completedBookings,
      pendingMechanics,
      openDisputes,
      totalRevenueAgg,
      bookingStatusDistribution,
      paymentStatusDistribution,
      monthlyTrends,
      topProblemCategories,
      disputeCategories,
      mechanicApprovalTrend,
      pendingCertAgg,
    ] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "completed" }),
      User.countDocuments({ role: "mechanic", isApproved: false }),
      Booking.countDocuments({ "dispute.status": { $in: OPEN_DISPUTE_STATUSES } }),
      Booking.aggregate([
        { $match: { "payment.status": "completed" } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", "unknown"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$payment.status", "pending"] },
            count: { $sum: 1 },
            amount: {
              $sum: {
                $cond: [
                  { $eq: ["$payment.status", "completed"] },
                  "$payment.amount",
                  0,
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        {
          $project: {
            status: "$_id",
            count: 1,
            amount: 1,
            _id: 0,
          },
        },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$payment.status", "completed"] }, "$payment.amount", 0],
              },
            },
            disputes: {
              $sum: {
                $cond: [
                  { $in: ["$dispute.status", OPEN_DISPUTE_STATUSES] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            month: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                {
                  $cond: [
                    { $lt: ["$_id.month", 10] },
                    { $concat: ["0", { $toString: "$_id.month" }] },
                    { $toString: "$_id.month" },
                  ],
                },
              ],
            },
            bookings: 1,
            revenue: 1,
            disputes: 1,
            _id: 0,
          },
        },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$problemCategory", "Other"] },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$payment.status", "completed"] }, "$payment.amount", 0],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
        {
          $project: {
            category: "$_id",
            count: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]),
      Booking.aggregate([
        { $match: { "dispute.status": { $in: OPEN_DISPUTE_STATUSES } } },
        {
          $group: {
            _id: { $ifNull: ["$dispute.category", "other"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $project: {
            category: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            role: "mechanic",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            applications: { $sum: 1 },
            approved: { $sum: { $cond: ["$isApproved", 1, 0] } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            month: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                {
                  $cond: [
                    { $lt: ["$_id.month", 10] },
                    { $concat: ["0", { $toString: "$_id.month" }] },
                    { $toString: "$_id.month" },
                  ],
                },
              ],
            },
            applications: 1,
            approved: 1,
            _id: 0,
          },
        },
      ]),
      MechanicProfile.aggregate([
        { $unwind: { path: "$certifications", preserveNullAndEmptyArrays: false } },
        { $match: { "certifications.verificationStatus": "pending" } },
        { $count: "count" },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const completionRate = totalBookings
      ? Number(((completedBookings / totalBookings) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      analytics: {
        summary: {
          totalBookings,
          completedBookings,
          completionRate,
          openDisputes,
          pendingMechanics,
          pendingCertifications: pendingCertAgg[0]?.count || 0,
          totalRevenue,
        },
        bookingStatusDistribution,
        paymentStatusDistribution,
        monthlyTrends,
        topProblemCategories,
        disputeCategories,
        mechanicApprovalTrend,
      },
    });
  } catch (error) {
    console.error("Staff analytics error:", error);
    next(new AppError("Failed to load staff analytics", 500));
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

// Get pending certification verification requests
exports.getPendingCertificationRequests = async (req, res, next) => {
  try {
    const profiles = await MechanicProfile.find({
      "certifications.verificationStatus": "pending",
    }).populate("user", "name email phone");

    const requests = [];
    profiles.forEach((profile) => {
      (profile.certifications || []).forEach((cert, index) => {
        if ((cert.verificationStatus || "pending") === "pending") {
          requests.push({
            mechanicId: profile.user?._id,
            mechanicName: profile.user?.name,
            mechanicEmail: profile.user?.email,
            certificationIndex: index,
            certification: cert,
          });
        }
      });
    });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get pending certifications error:", error);
    next(new AppError("Failed to fetch pending certification requests", 500));
  }
};

// Approve a specific certification
exports.approveCertification = async (req, res, next) => {
  try {
    const { id, certIndex } = req.params;
    const index = Number.parseInt(certIndex, 10);

    if (!Number.isInteger(index) || index < 0) {
      return next(new AppError("Invalid certification index", 400));
    }

    const profile = await MechanicProfile.findOne({ user: id });
    if (!profile) {
      return next(new AppError("Mechanic profile not found", 404));
    }

    if (!profile.certifications || !profile.certifications[index]) {
      return next(new AppError("Certification not found", 404));
    }

    profile.certifications[index].verificationStatus = "verified";
    await profile.save();

    res.json({
      success: true,
      message: "Certification approved successfully",
      certification: profile.certifications[index],
    });
  } catch (error) {
    console.error("Approve certification error:", error);
    next(new AppError("Failed to approve certification", 500));
  }
};

// Reject a specific certification
exports.rejectCertification = async (req, res, next) => {
  try {
    const { id, certIndex } = req.params;
    const index = Number.parseInt(certIndex, 10);

    if (!Number.isInteger(index) || index < 0) {
      return next(new AppError("Invalid certification index", 400));
    }

    const profile = await MechanicProfile.findOne({ user: id });
    if (!profile) {
      return next(new AppError("Mechanic profile not found", 404));
    }

    if (!profile.certifications || !profile.certifications[index]) {
      return next(new AppError("Certification not found", 404));
    }

    profile.certifications[index].verificationStatus = "rejected";
    await profile.save();

    res.json({
      success: true,
      message: "Certification rejected",
      certification: profile.certifications[index],
    });
  } catch (error) {
    console.error("Reject certification error:", error);
    next(new AppError("Failed to reject certification", 500));
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

    // Invalidate caches
    await Promise.all([
      invalidateAdminCache(),
      invalidateStaffCache(),
      invalidateMechanicCache(id),
    ]);

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

    const mechanic = await User.findById(id);
    if (!mechanic || mechanic.role !== "mechanic") {
      return next(new AppError("Mechanic not found", 404));
    }

    // Delete mechanic profile
    await MechanicProfile.findOneAndDelete({ user: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    // Invalidate caches
    await Promise.all([invalidateAdminCache(), invalidateStaffCache()]);

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

    // Invalidate caches after dispute resolution
    await invalidateBookingCaches(booking.user, booking.mechanic);

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

    const wasFirstTimePasswordChange = user.mustChangePassword;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 400));
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    if (wasFirstTimePasswordChange) {
      return req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error after password change:", err);
          return next(new AppError("Password changed, but failed to end session", 500));
        }

        return res.json({
          success: true,
          message: "Password changed successfully. Please log in again.",
          redirectUrl: "/auth/login",
          forceRelogin: true,
        });
      });
    }

    // Update session
    req.session.user.mustChangePassword = false;

    res.json({
      success: true,
      message: "Password changed successfully",
      redirectUrl: "/staff/profile",
      forceRelogin: false,
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
