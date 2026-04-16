const express = require("express");
const router = express.Router();
const User = require("../models/User");
const MechanicProfile = require("../models/MechanicProfile");
const Booking = require("../models/Booking");
const Chat = require("../models/Chat");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mechanic dashboard
router.get("/dashboard", (req, res) => {
  res.render("mechanic/dashboard", { title: "Mechanic Dashboard" });
});

// API: dashboard data as JSON (used by the static HTML)
router.get("/api/dashboard", async (req, res) => {
  try {
    const profile = await MechanicProfile.findOne({ user: req.user._id });
    const bookings = await Booking.find({ mechanic: req.user._id })
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

    const nearbyBookings = req.user.location && req.user.location.coordinates ? await Booking.find({
      status: "pending",
      mechanic: null,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: req.user.location.coordinates,
          },
          $maxDistance: 10000,
        },
      },
    })
      .populate("user", "name")
      .limit(5) : [];

    const userRequestedJob = req.user.location && req.user.location.coordinates ? await Booking.find({
      mechanic: req.user._id,
      status: "pending",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: req.user.location.coordinates,
          },
          $maxDistance: 10000,
        },
      },
    }).populate("user", "name") : [];

    res.json({
      title: "Mechanic Dashboard",
      user: req.user,
      profile,
      bookings,
      stats,
      totalEarnings,
      todayEarnings,
      nearbyBookings,
      userRequestedJob,
      flash: {
        success_msg: req.flash('success_msg') || [],
        error_msg: req.flash('error_msg') || [],
        error: req.flash('error') || [],
      },
    });
  } catch (error) {
    console.error("Mechanic dashboard API error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// View booking details
router.get('/booking/:id', (req, res) => {
  res.render("mechanic/booking-details", { title: "Booking Details" });
});

// API: booking details
router.get('/api/booking/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone address')
      .populate('mechanic', 'name phone');

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.mechanic && booking.mechanic._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const chat = await Chat.findOne({ booking: booking._id });
    const profile = await MechanicProfile.findOne({ user: req.user._id });

  res.json({ booking, chat, profile, user: req.user, flash: { success_msg: req.flash('success_msg') || [], error_msg: req.flash('error_msg') || [], error: req.flash('error') || [] } });
  } catch (error) {
    console.error('Booking API error:', error);
    res.status(500).json({ error: 'Failed to load booking details' });
  }
});

// Search users by name/email and return all their booking details
router.get('/api/bookings/search-user', async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const safeQuery = escapeRegex(query);
    const users = await User.find({
      role: "user",
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } }
      ]
    })
      .select("_id name email phone")
      .limit(20)
      .lean();

    if (!users.length) {
      return res.json({ success: true, query, users: [] });
    }

    const userIds = users.map((u) => u._id);
    const bookings = await Booking.find({ user: { $in: userIds } })
      .populate("user", "name email phone")
      .populate("mechanic", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const bookingsByUser = new Map();
    for (const booking of bookings) {
      const userId = booking.user?._id?.toString();
      if (!userId) continue;
      if (!bookingsByUser.has(userId)) bookingsByUser.set(userId, []);
      bookingsByUser.get(userId).push(booking);
    }

    const payload = users.map((user) => {
      const groupedBookings = bookingsByUser.get(String(user._id)) || [];
      return {
        ...user,
        bookingCount: groupedBookings.length,
        bookings: groupedBookings
      };
    });

    return res.json({ success: true, query, users: payload });
  } catch (error) {
    console.error("Search user bookings error:", error);
    return res.status(500).json({ success: false, message: "Failed to search user bookings" });
  }
});

// Accept booking
router.post("/booking/:id/accept", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      req.flash("error_msg", "Booking not found");
      return res.redirect("/mechanic/dashboard");
    }

    // Check if booking is in pending state
    if (booking.status !== "pending") {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: "Booking is not in pending state" });
      }
      req.flash("error_msg", "Booking is not in pending state");
      return res.redirect(`/mechanic/booking/${booking._id}`);
    }

    // Update booking status
    booking.mechanic = req.user._id;
    booking.status = "accepted";
    booking.updatedAt = new Date();
    await booking.save();

    // Create a chat for this booking if it doesn't exist
    let chat = await Chat.findOne({ booking: booking._id });
    if (!chat) {
      chat = new Chat({
        booking: booking._id,
        participants: [booking.user, req.user._id],
      });
      await chat.save();
    }

    // Notify connected clients immediately so booking UI can switch to live-tracking state
    const io = req.app.get('io');
    if (io) {
      const statusPayload = {
        bookingId: booking._id.toString(),
        status: booking.status,
        updatedAt: booking.updatedAt,
      };
      io.to(booking.user.toString()).emit('booking-status-changed', statusPayload);
      if (booking.mechanic) {
        io.to(booking.mechanic.toString()).emit('booking-status-changed', statusPayload);
      }
    }

    // Notify the user that their booking was accepted
    if (io && io.createNotification) {
      await io.createNotification({
        recipient: booking.user,
        type: "booking-accepted",
        title: "🎉 Booking Accepted!",
        message: `${req.user.name} has accepted your service request and is on the way!`,
        data: {
          bookingId: booking._id,
          mechanicId: req.user._id,
          link: `/user/booking/${booking._id}`,
        },
        priority: "high",
      });
    }

    // Return JSON for API calls, redirect for form submissions
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: "Booking accepted successfully", booking });
    }

    req.flash("success_msg", "Booking accepted successfully");
    res.redirect(`/mechanic/booking/${booking._id}`);
  } catch (error) {
    console.error("Accept booking error:", error);
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: "Failed to accept booking" });
    }
    req.flash("error_msg", "Failed to accept booking");
    res.redirect(`/mechanic/booking/${req.params.id}`);
  }
});

// Start service
router.post("/booking/:id/start", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      req.flash("error_msg", "Booking not found");
      return res.redirect("/mechanic/dashboard");
    }

    // Check if mechanic is authorized
    if (booking.mechanic.toString() !== req.user._id.toString()) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      req.flash("error_msg", "Not authorized");
      return res.redirect("/mechanic/dashboard");
    }

    // Check if booking is in accepted state
    if (booking.status !== "accepted") {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: "Booking is not in accepted state" });
      }
      req.flash("error_msg", "Booking is not in accepted state");
      return res.redirect(`/mechanic/booking/${booking._id}`);
    }

    // Update booking status
    booking.status = "in-progress";
    booking.updatedAt = new Date();
    await booking.save();

    // Notify connected clients immediately so booking UI can react in real time
    const io = req.app.get('io');
    if (io) {
      const statusPayload = {
        bookingId: booking._id.toString(),
        status: booking.status,
        updatedAt: booking.updatedAt,
      };
      io.to(booking.user.toString()).emit('booking-status-changed', statusPayload);
      if (booking.mechanic) {
        io.to(booking.mechanic.toString()).emit('booking-status-changed', statusPayload);
      }
    }

    // Notify the user that service has started
    if (io && io.createNotification) {
      await io.createNotification({
        recipient: booking.user,
        type: "booking-started",
        title: "🔧 Service Started!",
        message: `${req.user.name} has started working on your vehicle.`,
        data: {
          bookingId: booking._id,
          mechanicId: req.user._id,
          link: `/user/booking/${booking._id}`,
        },
        priority: "normal",
      });
    }

    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: "Service started successfully", booking });
    }

    req.flash("success_msg", "Service started successfully");
    res.redirect(`/mechanic/booking/${booking._id}`);
  } catch (error) {
    console.error("Start service error:", error);
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: "Failed to start service" });
    }
    req.flash("error_msg", "Failed to start service");
    res.redirect(`/mechanic/booking/${req.params.id}`);
  }
});

// Complete service
router.post("/booking/:id/complete", async (req, res) => {
  try {
    const { amount, notes } = req.body;

    if (!amount) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: "Please enter the service amount" });
      }
      req.flash("error_msg", "Please enter the service amount");
      return res.redirect(`/mechanic/booking/${req.params.id}`);
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      req.flash("error_msg", "Booking not found");
      return res.redirect("/mechanic/dashboard");
    }

    // Check if mechanic is authorized
    if (booking.mechanic.toString() !== req.user._id.toString()) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      req.flash("error_msg", "Not authorized");
      return res.redirect("/mechanic/dashboard");
    }

    // Check if booking is in in-progress state
    if (booking.status !== "in-progress") {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: "Booking is not in in-progress state" });
      }
      req.flash("error_msg", "Booking is not in in-progress state");
      return res.redirect(`/mechanic/booking/${booking._id}`);
    }

    // Update booking status and payment info
    booking.status = "completed";
    booking.payment.amount = Number.parseFloat(amount);
    booking.notes = notes;
    booking.updatedAt = new Date();
    await booking.save();

    // Emit socket event to notify user and mechanic (if online)
    try {
      const io = req.app.get('io');
      if (io) {
        const notifyUsers = [booking.user.toString()];
        if (booking.mechanic) notifyUsers.push(booking.mechanic.toString());

        notifyUsers.forEach((userId) => {
          try {
            io.to(userId).emit('booking-status-changed', {
              bookingId: booking._id.toString(),
              status: booking.status,
              updatedAt: booking.updatedAt,
            });
          } catch (e) {
            // fallback to global emit
            io.emit('booking-status-changed', {
              bookingId: booking._id.toString(),
              status: booking.status,
              updatedAt: booking.updatedAt,
            });
          }
        });

        // Send notification to user about service completion
        if (io.createNotification) {
          await io.createNotification({
            recipient: booking.user,
            type: "booking-completed",
            title: "✅ Service Completed!",
            message: `Your service has been completed. Amount due: ₹${amount}`,
            data: {
              bookingId: booking._id,
              mechanicId: req.user._id,
              amount: Number.parseFloat(amount),
              link: `/user/booking/${booking._id}`,
            },
            priority: "high",
          });
        }
      }
    } catch (emitErr) {
      console.error('Error emitting booking status change:', emitErr);
    }

    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: "Service completed successfully", booking });
    }

    req.flash("success_msg", "Service completed successfully");
    res.redirect(`/mechanic/booking/${booking._id}`);
  } catch (error) {
    console.error("Complete service error:", error);
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: "Failed to complete service" });
    }
    req.flash("error_msg", "Failed to complete service");
    res.redirect(`/mechanic/booking/${req.params.id}`);
  }
});

// View booking history
router.get('/history', (req, res) => {
  res.render("mechanic/history", { title: "Job History" });
});

router.get('/api/history', async (req, res) => {
  try {
    const bookings = await Booking.find({ mechanic: req.user._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    const profile = await MechanicProfile.findOne({ user: req.user._id });
  res.json({ bookings, user: req.user, profile, flash: { success_msg: req.flash('success_msg') || [], error_msg: req.flash('error_msg') || [], error: req.flash('error') || [] } });
  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ error: 'Failed to load booking history' });
  }
});

// Profile page
router.get('/profile', (req, res) => {
  res.render("mechanic/profile", { title: "My Profile" });
});

router.get('/api/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email phone role location createdAt isApproved');
    const profile = await MechanicProfile.findOne({ user: req.user._id });
  res.json({ user, profile, flash: { success_msg: req.flash('success_msg') || [], error_msg: req.flash('error_msg') || [], error: req.flash('error') || [] } });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Update profile
router.post("/profile", async (req, res) => {
  try {
    const expectsJson = req.headers.accept?.includes("application/json");

    const {
      name,
      phone,
      address,
      latitude,
      longitude,
      specialization,
      experience,
      hourlyRate,
      certifications,
    } = req.body;

    const existingUser = await User.findById(req.user._id);
    const existingProfile = await MechanicProfile.findOne({ user: req.user._id });

    let parsedCertifications = certifications;
    if (typeof certifications === "string") {
      try {
        parsedCertifications = JSON.parse(certifications);
      } catch (e) {
        parsedCertifications = [];
      }
    }

    const normalizedSpecialization = Array.isArray(specialization)
      ? specialization.filter(Boolean)
      : specialization
      ? [specialization]
      : existingProfile?.specialization || [];

    const resolvedAddress = address || existingUser?.location?.address || "";

    // Validation
    if (
      !name ||
      !phone ||
      !resolvedAddress ||
      normalizedSpecialization.length === 0 ||
      !experience ||
      !hourlyRate
    ) {
      if (expectsJson) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required profile fields (name, phone, address, specialization, experience, hourly rate)",
        });
      }
      req.flash("error_msg", "Please fill in all fields");
      return res.redirect("/mechanic/profile");
    }

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      name,
      phone,
      location: {
        type: "Point",
        coordinates: [
          Number.parseFloat(longitude) || 0,
          Number.parseFloat(latitude) || 0,
        ],
        address: resolvedAddress,
      },
    });

    // Update mechanic profile
    const normalizedCertifications = Array.isArray(parsedCertifications)
      ? parsedCertifications
          .filter((cert) => cert && (cert.name || cert.issuer || cert.year || cert.imageUrl))
          .map((cert) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            year: cert.year ? Number.parseInt(cert.year, 10) : undefined,
            imageUrl: cert.imageUrl || "",
            verificationStatus: cert.verificationStatus || "pending",
          }))
      : [];

    if (req.files) {
      for (let i = 0; i < normalizedCertifications.length; i++) {
        const fileKey = `certFile_${i}`;
        const certFile = req.files[fileKey];
        if (!certFile) continue;

        const uploaded = await cloudinary.uploader.upload(certFile.tempFilePath, {
          folder: "mechanic-certifications",
          resource_type: "image",
        });

        normalizedCertifications[i].imageUrl = uploaded.secure_url;
        normalizedCertifications[i].verificationStatus = "pending";
      }
    }

    const updatedProfile = await MechanicProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        specialization: Array.isArray(specialization)
          ? specialization.filter(Boolean)
          : normalizedSpecialization,
        experience: Number.parseInt(experience),
        hourlyRate: Number.parseFloat(hourlyRate),
        certifications: normalizedCertifications,
      },
      { new: true }
    );

    if (expectsJson) {
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    }

    req.flash("success_msg", "Profile updated successfully");
    res.redirect("/mechanic/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    if (req.headers.accept?.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
    req.flash("error_msg", "Failed to update profile");
    res.redirect("/mechanic/profile");
  }
});

// Toggle availability
router.post("/toggle-availability", async (req, res) => {
  try {
    const profile = await MechanicProfile.findOne({ user: req.user._id });

    profile.availability = !profile.availability;
    await profile.save();

    req.flash(
      "success_msg",
      `You are now ${
        profile.availability ? "available" : "unavailable"
      } for new bookings`
    );
    res.redirect("/mechanic/dashboard");
  } catch (error) {
    console.error("Toggle availability error:", error);
    req.flash("error_msg", "Failed to update availability");
    res.redirect("/mechanic/dashboard");
  }
});

// Change mechanic password
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Mechanic change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
});

// ==================== ANALYTICS ENDPOINT ====================
const analyticsService = require("../services/analyticsService");

// Get mechanic's analytics data
router.get("/api/analytics", async (req, res) => {
  try {
    const data = await analyticsService.getMechanicAnalytics(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Mechanic analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

module.exports = router;
