const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
const Subscription = require("../models/Subscription")
const Chat = require("../models/Chat")
const GeneralChat = require("../models/GeneralChat")
const MechanicProfile = require("../models/MechanicProfile")
const bcrypt = require("bcryptjs")

router.get("/api/maintenance", async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    const recentMaintenance = await Booking.find({
      user: req.user._id,
      problemCategory: "Maintenance",
      status: { $in: ["completed", "cancelled"] }
    }).sort({ createdAt: -1 }).limit(5)

    res.json({
      user: req.user,
      subscription,
      recentMaintenance,
    })
  } catch (error) {
    console.error("Maintenance API error:", error)
    res.status(500).json({ error: "Failed to load maintenance data" })
  }
})

// Get premium subscription data
router.get("/api/premium", async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    res.json({
      success: true,
      subscription,
      user: {
        isPremium: req.user.isPremium,
        premiumTier: req.user.premiumTier
      }
    })
  } catch (error) {
    console.error("Premium API error:", error)
    res.status(500).json({ success: false, error: "Failed to load premium data" })
  }
})


// Chat APIs

// Get chat for a booking
router.get("/api/chat/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "name")
      .populate("mechanic", "name");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if user is authorized to view this chat
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      booking.mechanic &&
      booking.mechanic._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Get or create chat
    let chat = await Chat.findOne({ booking: booking._id });
    if (!chat && booking.mechanic) {
      chat = new Chat({
        booking: booking._id,
        participants: [booking.user._id, booking.mechanic._id],
      });
      await chat.save();
    }

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not available yet" });
    }

    // Mark messages as read
    if (chat.messages.length > 0) {
      let updated = false;
      chat.messages.forEach((message) => {
        if (
          message.sender.toString() !== req.user._id.toString() &&
          !message.read
        ) {
          message.read = true;
          updated = true;
        }
      });

      if (updated) {
        await chat.save();
      }
    }

    res.json({ success: true, chat, booking });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ success: false, message: "Failed to load chat" });
  }
});

// Send message API
router.post("/api/chat/:chatId/send", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      content: message.trim(),
      timestamp: new Date(),
      read: false,
    };

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    chat.updatedAt = new Date();
    await chat.save();

    // Populate sender info for response
    await chat.populate('messages.sender', 'name role');

    const savedMessage = chat.messages[chat.messages.length - 1];

    res.status(200).json({ success: true, message: savedMessage });
  } catch (error) {
    console.error("Send message API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get messages API
router.get("/api/chat/:chatId/messages", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "messages.sender",
      "name role"
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Mark messages as read
    let updated = false;
    chat.messages.forEach((message) => {
      if (
        message.sender._id.toString() !== req.user._id.toString() &&
        !message.read
      ) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Get messages API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get unread message count
router.get("/api/chat/unread/count", async (req, res) => {
  try {
    // Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: req.user._id,
    });

    let unreadCount = 0;

    // Count unread messages in each chat
    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        if (
          message.sender.toString() !== req.user._id.toString() &&
          !message.read
        ) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error("Unread count API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// General Chat APIs (for non-booking chats)

// Get user's general chats
router.get("/api/chat", async (req, res) => {
  try {
    const chats = await GeneralChat.find({
      participants: req.user._id,
    })
      .populate("participants", "name role")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Get chats API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create new general chat with a mechanic
router.post("/api/chat", async (req, res) => {
  try {
    const { mechanicId } = req.body;

    if (!mechanicId) {
      return res.status(400).json({ success: false, message: "Mechanic ID is required" });
    }

    // Check if mechanic exists and is approved
    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== "mechanic" || !mechanic.isApproved) {
      return res.status(404).json({ success: false, message: "Mechanic not found or not approved" });
    }

    // Check if chat already exists
    const existingChat = await GeneralChat.findOne({
      participants: { $all: [req.user._id, mechanicId] },
    });

    if (existingChat) {
      return res.status(200).json({ success: true, chat: existingChat });
    }

    // Create new chat
    const chat = new GeneralChat({
      participants: [req.user._id, mechanicId],
    });

    await chat.save();

    // Populate participants for response
    await chat.populate("participants", "name role");

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("Create chat API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get messages for a general chat
router.get("/api/chat/:chatId/messages", async (req, res) => {
  try {
    const chat = await GeneralChat.findById(req.params.chatId).populate(
      "messages.sender",
      "name role"
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Mark messages as read
    let updated = false;
    chat.messages.forEach((message) => {
      if (
        message.sender._id.toString() !== req.user._id.toString() &&
        !message.read
      ) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Get messages API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Send message in general chat
router.post("/api/chat/:chatId/send", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const chat = await GeneralChat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      content: message.trim(),
      timestamp: new Date(),
      read: false,
    };

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    chat.updatedAt = new Date();
    await chat.save();

    // Populate sender info for response
    await chat.populate('messages.sender', 'name role');

    const savedMessage = chat.messages[chat.messages.length - 1];

    res.status(200).json({ success: true, message: savedMessage });
  } catch (error) {
    console.error("Send message API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get unread count for general chats
router.get("/api/chat/general/unread/count", async (req, res) => {
  try {
    // Find all general chats where the user is a participant
    const chats = await GeneralChat.find({
      participants: req.user._id,
    });

    let unreadCount = 0;

    // Count unread messages in each chat
    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        if (
          message.sender.toString() !== req.user._id.toString() &&
          !message.read
        ) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error("General unread count API error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// View booking details
router.get("/booking/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("mechanic", "name phone")
      .populate("user", "name phone")

    if (!booking) {
      req.flash("error_msg", "Booking not found")
      return res.redirect("/user/dashboard")
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      req.flash("error_msg", "Not authorized")
      return res.redirect("/user/dashboard")
    }

    // Get nearby mechanics if booking is pending
    let nearbyMechanics = []
    if (booking.status === "pending") {
      // Get mechanics sorted by distance, with preference for premium bookings
      const geoNearPipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: booking.location.coordinates,
            },
            distanceField: "distance",
            maxDistance: 10000, // 10km
            spherical: true,
          },
        },
        {
          $match: {
            role: "mechanic",
            isApproved: true,
          },
        },
        {
          $sort: {
            distance: 1,
          },
        },
        {
          $limit: 10,
        },
      ]

      nearbyMechanics = await User.aggregate(geoNearPipeline)
    }

    // Get chat if exists
    const chat = await Chat.findOne({ booking: booking._id })

    // Get subscription status
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })
    const isPremium = !!subscription

    // Get free towing count for premium users
    let freeTowingRemaining = 0
    if (isPremium && subscription.features.freeTowing > 0) {
      // Count how many bookings have used free towing
      const usedTowingCount = await Booking.countDocuments({
        user: req.user._id,
        requiresTowing: true,
        "payment.discountApplied": { $gt: 0 },
        createdAt: { $gte: subscription.startDate },
      })
      freeTowingRemaining = Math.max(0, subscription.features.freeTowing - usedTowingCount)
    }
    console.log(booking,
      nearbyMechanics,
      chat,
      isPremium,
      subscription,
      freeTowingRemaining,)

    res.render("user/booking-details", {
      title: "Booking Details",
      booking,
      nearbyMechanics,
      chat,
      user: req.user,
      isPremium,
      subscription,
      freeTowingRemaining,
    })
  } catch (error) {
    console.error("View booking error:", error)
    req.flash("error_msg", "Failed to load booking details")
    res.redirect("/user/dashboard")
  }
})

// Select mechanic for booking
router.post("/booking/:id/select-mechanic", async (req, res) => {
  try {
    const { mechanicId } = req.body

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if user is authorized
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Check if booking is in pending state
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking is not in pending state" });
    }

    // Update booking with selected mechanic
    booking.mechanic = mechanicId
    // Keep status as pending - mechanic needs to accept
    await booking.save()

    // Create a chat for this booking
    const existingChat = await Chat.findOne({ booking: booking._id });
    if (!existingChat) {
      const newChat = new Chat({
        booking: booking._id,
        participants: [req.user._id, mechanicId],
      });
      await newChat.save();
    }

    return res.status(200).json({ success: true, message: "Request sent to mechanic successfully. Waiting for mechanic to accept.", booking });
  } catch (error) {
    console.error("Select mechanic error:", error)
    return res.status(500).json({ success: false, message: "Failed to select mechanic" });
  }
})

// Cancel booking
router.post("/booking/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      req.flash("error_msg", "Booking not found")
      return res.redirect("/user/dashboard")
    }

    // Check if user is authorized
    if (booking.user.toString() !== req.user._id.toString()) {
      req.flash("error_msg", "Not authorized")
      return res.redirect("/user/dashboard")
    }

    // Check if booking can be cancelled
    if (!["pending", "accepted"].includes(booking.status)) {
      req.flash("error_msg", "Cannot cancel booking at this stage")
      return res.redirect(`/user/booking/${booking._id}`)
    }

    // Update booking status
    booking.status = "cancelled"
    booking.updatedAt = new Date()
    await booking.save()

    // If this was a basic user booking, decrement the count
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    if (!subscription) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { basicBookingsUsed: -1 },
      })
    }

    req.flash("success_msg", "Booking cancelled successfully")
    res.redirect("/user/dashboard")
  } catch (error) {
    console.error("Cancel booking error:", error)
    req.flash("error_msg", "Failed to cancel booking")
    res.redirect(`/user/booking/${req.params.id}`)
  }
})

// Rate mechanic/service
router.post("/booking/:id/rate", async (req, res) => {
  try {
    const { rating, comment, recommend } = req.body

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required" })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Check if user is authorized
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    // Check if booking is completed and paid
    if (booking.status !== "completed" || booking.payment.status !== "completed") {
      return res.status(400).json({ success: false, message: "Cannot rate until service is completed and paid" })
    }

    // Check if already rated
    if (booking.rating && booking.rating.value) {
      return res.status(400).json({ success: false, message: "You have already rated this service" })
    }

    // Add rating to booking
    booking.rating = {
      value: Number.parseInt(rating, 10),
      comment: comment,
      recommend: recommend === "1" || recommend === "on" || recommend === true,
      createdAt: new Date(),
    }

    await booking.save()

    // Update mechanic profile rating
    const mechanicProfile = await MechanicProfile.findOne({ user: booking.mechanic })

    if (mechanicProfile) {
      // Add the new review
      mechanicProfile.reviews.push({
        user: req.user._id,
        booking: booking._id,
        rating: Number.parseInt(rating, 10),
        comment: comment,
        recommend: recommend === "1" || recommend === "on" || recommend === true,
        date: new Date(),
      })

      // Calculate new average rating
      const totalRating = mechanicProfile.reviews.reduce((sum, review) => sum + review.rating, 0)
      mechanicProfile.rating = totalRating / mechanicProfile.reviews.length

      await mechanicProfile.save()
    }

    return res.status(200).json({ success: true, message: "Rating submitted successfully" })
  } catch (error) {
    console.error("Rate mechanic error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

// View booking history
router.get("/history", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("mechanic", "name").sort({ createdAt: -1 })

    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })
    const isPremium = !!subscription

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    // Calculate remaining bookings for basic users
    const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

    res.render("user/history", {
      title: "Booking History",
    })
  } catch (error) {
    console.error("Booking history error:", error)
    req.flash("error_msg", "Failed to load booking history")
    res.redirect("/user/dashboard")
  }
})

// Premium Subscription routes

// View premium plans
router.get("/premium", async (req, res) => {
  try {
    // Check if user already has an active subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    res.render("user/premium", {
      title: "Premium Plans",
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error("Premium plans error:", error)
    req.flash("error_msg", "Failed to load premium plans")
    res.redirect("/user/dashboard")
  }
})

// Subscribe to premium - Stripe payment page
router.post("/premium/subscribe", async (req, res) => {
  try {
    const { plan } = req.body

    if (!["monthly", "yearly"].includes(plan)) {
      req.flash("error_msg", "Invalid plan selected")
      return res.redirect("/user/premium")
    }

    res.render("payment/subscription", {
      title: "Subscribe to Premium",
      user: req.user,
      plan,
      amount: plan === "monthly" ? 9.99 : 99.99,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error("Subscription page error:", error)
    req.flash("error_msg", "Failed to load subscription page")
    res.redirect("/user/premium")
  }
})

// Cancel premium subscription
router.post("/premium/cancel", async (req, res) => {
  try {
    // Find active subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found" })
    }

    // Update subscription
    subscription.status = "cancelled"
    subscription.cancelledAt = new Date()
    await subscription.save()

    // Update user's premium status
    await User.findByIdAndUpdate(req.user._id, {
      isPremium: false,
      premiumTier: "none",
      premiumFeatures: {
        priorityService: false,
        tracking: false,
        discounts: 0,
        emergencyAssistance: false,
        freeTowing: 0,
        maintenanceChecks: false,
      },
    })

    return res.status(200).json({ success: true, message: "Your premium subscription has been cancelled" })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return res.status(500).json({ success: false, message: "Failed to cancel subscription" })
  }
})
router.get("/premium/success", async (req, res) => {
  try {
    res.render("payment/subscription-success", {
      title: "Subscription Successful",
    })
  } catch (error) {
    console.error("Subscription success page error:", error)
    req.flash("error_msg", "Failed to load subscription success page")
    res.redirect("/user/premium")
  }
})
// Profile page
router.get("/profile", async (req, res) => {
  try {
    // Get subscription details
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    const isPremium = !!subscription

    // Get subscription history
    const subscriptionHistory = await Subscription.find({
      user: req.user._id,
    }).sort({ createdAt: -1 })

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    // Calculate remaining bookings for basic users
    const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

    const premiumFeatures = await User.findById(req.user._id).select("premiumFeatures")


    res.render("user/profile", {
      title: "My Profile",
    })
  } catch (error) {
    console.error("Profile page error:", error)
    req.flash("error_msg", "Failed to load profile")
    res.redirect("/user/dashboard")
  }
})

// Emergency assistance
router.get("/emergency", async (req, res) => {
  try {
    // Check if user has emergency assistance
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
      "features.emergencyAssistance": true,
    })

    if (!subscription) {
      req.flash("error_msg", "Emergency assistance is only available for yearly premium subscribers")
      return res.redirect("/user/premium")
    }

    res.render("user/emergency", {
      title: "Emergency Assistance",
    })
  } catch (error) {
    console.error("Emergency page error:", error)
    req.flash("error_msg", "Failed to load emergency assistance page")
    res.redirect("/user/dashboard")
  }
})

// Request emergency assistance
router.post("/emergency", async (req, res) => {
  try {
    // Check if user has emergency assistance
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
      "features.emergencyAssistance": true,
    })

    if (!subscription) {
      req.flash("error_msg", "Emergency assistance is only available for yearly premium subscribers")
      return res.redirect("/user/premium")
    }

    const { latitude, longitude, address, problemDescription } = req.body

    // Create emergency booking
    const booking = new Booking({
      user: req.user._id,
      problemCategory: "Emergency Assistance",
      description: problemDescription,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        address,
      },
      isPremiumBooking: true,
      priority: 2, // Highest priority
      emergencyRequest: true,
      status: "pending",
    })

    await booking.save()

    req.flash("success_msg", "Emergency assistance request submitted. A mechanic will be assigned shortly.")
    res.redirect(`/user/booking/${booking._id}`)
  } catch (error) {
    console.error("Emergency request error:", error)
    req.flash("error_msg", "Failed to submit emergency request")
    res.redirect("/user/emergency")
  }
})

// Request maintenance check (for yearly premium users)
router.get("/maintenance", async (req, res) => {
  try {
    // Check if user has maintenance checks feature
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
      "features.maintenanceChecks": true,
    })

    if (!subscription) {
      req.flash("error_msg", "Maintenance checks are only available for yearly premium subscribers")
      return res.redirect("/user/premium")
    }

    // Check if user has already scheduled maintenance this quarter
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentMaintenance = await Booking.findOne({
      user: req.user._id,
      problemCategory: "Maintenance Check",
      createdAt: { $gte: threeMonthsAgo },
    })

    res.render("user/maintenance", {
      title: "Schedule Maintenance Check",
    })
  } catch (error) {
    console.error("Maintenance page error:", error)
    req.flash("error_msg", "Failed to load maintenance page")
    res.redirect("/user/dashboard")
  }
})

// Schedule maintenance check
router.post("/maintenance", async (req, res) => {
  try {
    // Check if user has maintenance checks feature
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
      "features.maintenanceChecks": true,
    })

    if (!subscription) {
      req.flash("error_msg", "Maintenance checks are only available for yearly premium subscribers")
      return res.redirect("/user/premium")
    }

    // Check if user has already scheduled maintenance this quarter
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentMaintenance = await Booking.findOne({
      user: req.user._id,
      problemCategory: "Maintenance Check",
      createdAt: { $gte: threeMonthsAgo },
    })

    if (recentMaintenance) {
      req.flash("error_msg", "You have already scheduled a maintenance check in the last 3 months")
      return res.redirect("/user/maintenance")
    }

    const { preferredDate, notes, latitude, longitude, address } = req.body

    // Create maintenance booking
    const booking = new Booking({
      user: req.user._id,
      problemCategory: "Maintenance Check",
      description: `Quarterly maintenance check scheduled for ${preferredDate}. Notes: ${notes || "None"}`,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        address,
      },
      isPremiumBooking: true,
      priority: 1, // Medium priority
      notes: notes,
      status: "pending",
    })

    await booking.save()

    req.flash("success_msg", "Maintenance check scheduled successfully")
    res.redirect(`/user/booking/${booking._id}`)
  } catch (error) {
    console.error("Maintenance scheduling error:", error)
    req.flash("error_msg", "Failed to schedule maintenance check")
    res.redirect("/user/maintenance")
  }
})

// Update profile
router.post("/profile", async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      latitude,
      longitude,
    } = req.body;

    // Validation
    if (
      !name ||
      !phone ||
      !address
    ) {
      req.flash("error_msg", "Please fill in all fields");
      return res.redirect("/user/profile");
    }

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      name,
      phone,
      address,
      location: {
        type: "Point",
        coordinates: [
          Number.parseFloat(longitude) || 0,
          Number.parseFloat(latitude) || 0,
        ],
      },
    });



    req.flash("success_msg", "Profile updated successfully");
    res.redirect("/user/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    req.flash("error_msg", "Failed to update profile");
    res.redirect("/mechanic/profile");
  }
});


router.post("/change-password", async (req, res) => {
  // console.log(req.user)
  try {
    const { newPassword, currentPassword, confirmPassword } = req.body;
    if (!newPassword || !currentPassword || !confirmPassword) {
      req.flash("error_msg", "Please fill in all fields");
      return res.redirect("/user/profile");
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash("error_msg", "Please enter correct password");
      return res.redirect("/user/profile");
    }

    await User.findByIdAndUpdate(req.user._id, {
      password: hashPassword
    })
    await user.save();
    req.flash("success_msg", "Profile updated successfully");
    res.redirect("/user/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    req.flash("error_msg", "Failed to update password");
    res.redirect("/user/profile");
  }

})



// API Endpoints for client-side data fetching

// Dashboard API
router.get("/api/dashboard", async (req, res) => {
  try {
    // Get user's bookings
    const bookings = await Booking.find({ user: req.user._id })
      .populate("mechanic", "name phone")
      .sort({ createdAt: -1 })

    // Get stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      inProgress: bookings.filter((b) => b.status === "in-progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }

    // Get category-wise data
    const categories = {}
    bookings.forEach((booking) => {
      if (!categories[booking.problemCategory]) {
        categories[booking.problemCategory] = 0
      }
      categories[booking.problemCategory]++
    })

    // Get user's subscription status
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    // Calculate remaining bookings for basic users
    const remainingBookings = subscription ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

    res.json({
      user: req.user,
      bookings,
      stats,
      categories,
      subscription,
      isPremium: !!subscription,
      remainingBookings,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    res.status(500).json({ error: "Failed to load dashboard data" })
  }
})

// Profile API
router.get("/api/profile", async (req, res) => {
  try {
    // Get subscription details
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    const isPremium = !!subscription

    // Get subscription history
    const subscriptionHistory = await Subscription.find({
      user: req.user._id,
    }).sort({ createdAt: -1 })

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    // Calculate remaining bookings for basic users
    const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

    // Get full user data to ensure every field is included
    const fullUser = await User.findById(req.user._id).select("-password")

    res.json({
      user: fullUser,
      subscription,
      subscriptionHistory,
      isPremium,
      remainingBookings,
      premiumFeatures: fullUser.premiumFeatures || {}
    })
  } catch (error) {
    console.error("Profile API error:", error)
    res.status(500).json({ error: "Failed to load profile data" })
  }
})

// Update Profile API (JSON)
router.post("/api/profile", async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ error: "Name, phone, and address are required" });
    }

    const updateData = {
      name,
      phone,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(longitude) || 0,
          parseFloat(latitude) || 0,
        ],
        address: address,
      },
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update API error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// History API
router.get("/api/history", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("mechanic", "name").sort({ createdAt: -1 })

    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })
    const isPremium = !!subscription

    // Get basic user booking count
    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    // Calculate remaining bookings for basic users
    const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

    res.json({
      bookings,
      user: req.user,
      isPremium,
      subscription,
      remainingBookings,
    })
  } catch (error) {
    console.error("History API error:", error)
    res.status(500).json({ error: "Failed to load booking history" })
  }
})

// Book API
router.get("/api/book", async (req, res) => {
  try {
    const subs = await Subscription.findOne({ user: req.user._id, status: "active", expiresAt: { $gt: new Date() } })

    res.json({
      user: req.user,
      isPremium: !!subs,
      plan: subs?.plan
    })
  } catch (error) {
    console.error("Book API error:", error)
    res.status(500).json({ error: "Failed to load book data" })
  }
})

// Bookings count API (for profile)
router.get("/api/bookings/count", async (req, res) => {
  try {
    const count = await Booking.countDocuments({ user: req.user._id })
    res.json({ count })
  } catch (error) {
    console.error("Bookings count API error:", error)
    res.status(500).json({ error: "Failed to get booking count" })
  }
})

// Premium API
router.get("/api/premium", async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    const activeBookingCount = await Booking.countDocuments({
      user: req.user._id,
      status: { $ne: "cancelled" }
    })

    res.json({
      subscription,
      activeBookingCount,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error("Premium API error:", error)
    res.status(500).json({ error: "Failed to load premium data" })
  }
})

// Booking details API
router.get("/api/booking/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("mechanic", "name phone")
      .populate("user", "name phone")

    if (!booking) {
      req.flash("error_msg", "Booking not found")
      return res.redirect("/user/dashboard")
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      req.flash("error_msg", "Not authorized")
      return res.redirect("/user/dashboard")
    }

    // Get nearby mechanics if booking is pending
    let nearbyMechanics = []
    if (booking.status === "pending") {
      // Get mechanics sorted by distance, with preference for premium bookings
      const geoNearPipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: booking.location.coordinates,
            },
            distanceField: "distance",
            maxDistance: 10000, // 10km
            spherical: true,
          },
        },
        {
          $match: {
            role: "mechanic",
            isApproved: true,
          },
        },
        {
          $sort: {
            distance: 1,
          },
        },
        {
          $limit: 10,
        },
      ]

      nearbyMechanics = await User.aggregate(geoNearPipeline)
    }

    // Get chat if exists
    const chat = await Chat.findOne({ booking: booking._id })

    // Get subscription status
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })
    const isPremium = !!subscription

    // Get free towing count for premium users
    let freeTowingRemaining = 0
    if (isPremium && subscription.features.freeTowing > 0) {
      // Count how many bookings have used free towing
      const usedTowingCount = await Booking.countDocuments({
        user: req.user._id,
        requiresTowing: true,
        "payment.discountApplied": { $gt: 0 },
        createdAt: { $gte: subscription.startDate },
      })
      freeTowingRemaining = Math.max(0, subscription.features.freeTowing - usedTowingCount)
    }
    res.json({
      booking,
      chat,
      user: req.user,
      nearbyMechanics,
      isPremium,
      subscription,
      freeTowingRemaining,
    });
  } catch (error) {
    console.error('Booking API error:', error);
    res.status(500).json({ error: 'Failed to load booking details' });
  }
});

// Emergency API
router.get("/api/emergency", async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    res.json({
      user: req.user,
      subscription,
    })
  } catch (error) {
    console.error("Emergency API error:", error)
    res.status(500).json({ error: "Failed to load emergency data" })
  }
})

// Maintenance API
router.get("/api/maintenance", async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    const recentMaintenance = await Booking.find({
      user: req.user._id,
      problemCategory: "Maintenance",
      status: { $in: ["completed", "cancelled"] }
    }).sort({ createdAt: -1 }).limit(5)

    res.json({
      user: req.user,
      subscription,
      recentMaintenance,
    })
  } catch (error) {
    console.error("Maintenance API error:", error)
    res.status(500).json({ error: "Failed to load maintenance data" })
  }
})

// ==================== STAFF CONTACT API ====================
// Get list of staff members that users can contact for support/disputes/emergency
router.get("/api/staff/contacts", async (req, res) => {
  try {
    const staffMembers = await User.find({
      role: "staff",
      isActive: true,
      mustChangePassword: false, // Only show staff who have completed their setup
    }).select("name email phone profileImage staffCredentials.address");

    const formattedStaff = staffMembers.map(staff => ({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      profileImage: staff.profileImage,
      address: staff.staffCredentials?.address || "N/A",
    }));

    res.json({
      success: true,
      staff: formattedStaff,
    });
  } catch (error) {
    console.error("Staff contacts API error:", error);
    res.status(500).json({ success: false, error: "Failed to load staff contacts" });
  }
});

// Create or get chat with staff member
router.post("/api/staff/chat", async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, message: "Staff ID is required" });
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff" || !staff.isActive) {
      return res.status(404).json({ success: false, message: "Staff not found or not available" });
    }

    // Check if chat already exists
    let chat = await GeneralChat.findOne({
      participants: { $all: [req.user._id, staffId] },
    });

    if (!chat) {
      // Create new chat
      chat = new GeneralChat({
        participants: [req.user._id, staffId],
        chatType: "support",
      });
      await chat.save();

      // Notify staff about new support request
      const io = req.app.get("io");
      if (io) {
        const Notification = require("../models/Notification");
        await Notification.createAndEmit(io, {
          recipient: staffId,
          type: "support-request",
          title: "🆕 New Support Request",
          message: `${req.user.name} wants to chat with you`,
          data: {
            chatId: chat._id,
            userId: req.user._id,
            link: `/staff/chat/${chat._id}`,
          },
          priority: "high",
        });
      }
    }

    await chat.populate("participants", "name role email phone");

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Staff chat API error:", error);
    res.status(500).json({ success: false, error: "Failed to create/get staff chat" });
  }
});

// Get messages from staff chat
router.get("/api/staff/chat/:chatId/messages", async (req, res) => {
  try {
    const chat = await GeneralChat.findById(req.params.chatId)
      .populate("participants", "name role email phone profileImage")
      .populate("messages.sender", "name role profileImage");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Mark unread messages as read
    let updated = false;
    chat.messages.forEach((msg) => {
      if (msg.sender._id.toString() !== req.user._id.toString() && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });
    if (updated) await chat.save();

    res.json({ 
      success: true, 
      chat,
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Get staff chat messages error:", error);
    res.status(500).json({ success: false, error: "Failed to get messages" });
  }
});

// Send message in staff chat
router.post("/api/staff/chat/:chatId/send", async (req, res) => {
  try {
    const { message, attachments } = req.body;
    
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const chat = await GeneralChat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      content: message,
      timestamp: new Date(),
      read: false,
      attachments: attachments || [],
    };

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    chat.updatedAt = new Date();
    await chat.save();

    // Get the recipient (other participant)
    const recipientId = chat.participants.find(p => p.toString() !== req.user._id.toString());
    const recipient = await User.findById(recipientId);

    // Emit socket event for real-time message
    const io = req.app.get("io");
    if (io) {
      // Emit to the chat room
      io.to(`staff-chat-${chat._id}`).emit("new-staff-message", {
        chatId: chat._id,
        message: {
          ...newMessage,
          sender: {
            _id: req.user._id,
            name: req.user.name,
            role: req.user.role,
          },
        },
      });

      // Create notification for recipient
      const Notification = require("../models/Notification");
      const notificationType = req.user.role === "staff" ? "user-message" : "staff-message";
      await Notification.createAndEmit(io, {
        recipient: recipientId,
        type: notificationType,
        title: req.user.role === "staff" ? "📩 Support Response" : "📩 New Message",
        message: `${req.user.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        data: {
          chatId: chat._id,
          userId: req.user._id,
          link: req.user.role === "staff" ? `/user/support/${chat._id}` : `/staff/chat/${chat._id}`,
        },
        priority: "normal",
      });
    }

    res.json({ success: true, message: "Message sent", newMessage });
  } catch (error) {
    console.error("Send staff chat message error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// Send email to staff
router.post("/api/staff/email", async (req, res) => {
  try {
    const { staffId, subject, message } = req.body;
    
    if (!staffId || !message) {
      return res.status(400).json({ success: false, message: "Staff ID and message are required" });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    // Send email
    const { sendSupportEmailToStaff } = require("../services/emailService");
    const emailResult = await sendSupportEmailToStaff(
      staff.email,
      staff.name,
      req.user.name,
      req.user.email,
      message
    );

    // Create notification for staff
    const io = req.app.get("io");
    if (io) {
      const Notification = require("../models/Notification");
      await Notification.createAndEmit(io, {
        recipient: staffId,
        type: "email-received",
        title: "📧 New Email Received",
        message: `${req.user.name} sent you an email: ${subject || 'Support Request'}`,
        data: {
          userId: req.user._id,
          userEmail: req.user.email,
          subject: subject || "Support Request",
          link: `/staff/emails`,
        },
        priority: "high",
      });
    }

    res.json({ 
      success: true, 
      message: "Email sent successfully",
      emailResult,
    });
  } catch (error) {
    console.error("Send email to staff error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Get user's support chats
router.get("/api/support/chats", async (req, res) => {
  try {
    const chats = await GeneralChat.find({
      participants: req.user._id,
    })
      .populate("participants", "name role email phone profileImage")
      .sort({ lastActivity: -1 });

    // Filter to only include chats with staff
    const supportChats = chats.filter(chat => 
      chat.participants.some(p => p.role === "staff")
    );

    res.json({ success: true, chats: supportChats });
  } catch (error) {
    console.error("Get support chats error:", error);
    res.status(500).json({ success: false, error: "Failed to get support chats" });
  }
});

// ==================== NEARBY MECHANICS API ====================
// Get nearby mechanics within specified radius (default 10km)
router.get("/api/mechanics/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(radius);

    // Find nearby mechanics using geospatial query
    const nearbyMechanics = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: maxDistance, // 10km default
          spherical: true,
        },
      },
      {
        $match: {
          role: "mechanic",
          isApproved: true,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "mechanicprofiles",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          phone: 1,
          email: 1,
          profileImage: 1,
          distance: 1,
          location: 1,
          isOnline: 1,
          lastSeen: 1,
          "profile.specialization": 1,
          "profile.experience": 1,
          "profile.rating": 1,
          "profile.hourlyRate": 1,
          "profile.availability": 1,
        },
      },
      {
        $limit: 50,
      },
    ]);

    // Get online status from socket
    const io = req.app.get('io');
    const onlineUsers = io?.getOnlineUsers?.() || {};

    const mechanicsWithStatus = nearbyMechanics.map(mechanic => ({
      ...mechanic,
      isOnline: !!onlineUsers[mechanic._id.toString()],
      distanceKm: (mechanic.distance / 1000).toFixed(2),
    }));

    res.json({
      success: true,
      mechanics: mechanicsWithStatus,
      count: mechanicsWithStatus.length,
    });
  } catch (error) {
    console.error("Nearby mechanics API error:", error);
    res.status(500).json({ success: false, error: "Failed to load nearby mechanics" });
  }
});

// ==================== DISPUTE API ====================
// Dispute categories
const DISPUTE_CATEGORIES = [
  "poor_service_quality",
  "fake_parts_used",
  "overcharging",
  "incomplete_work",
  "damage_to_vehicle",
  "unprofessional_behavior",
  "delayed_service",
  "wrong_diagnosis",
  "other"
];

// Raise a dispute for a booking
router.post("/api/dispute/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { category, reason, evidence } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Dispute reason is required" 
      });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to raise dispute for this booking" 
      });
    }

    // Check if booking is completed or in-progress (can't dispute pending or cancelled)
    if (!["completed", "in-progress"].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Can only raise dispute for completed or in-progress bookings" 
      });
    }

    // Check if already disputed
    if (booking.dispute && booking.dispute.isDisputed) {
      return res.status(400).json({ 
        success: false, 
        message: "A dispute has already been raised for this booking" 
      });
    }

    // Update booking with dispute
    booking.dispute = {
      isDisputed: true,
      category: category || "other",
      reason: reason.trim(),
      evidence: evidence || [],
      raisedBy: req.user._id,
      raisedAt: new Date(),
      status: "open",
    };
    booking.updatedAt = new Date();
    await booking.save();

    // Notify staff and admin about the dispute
    const io = req.app.get('io');
    if (io && io.notifyAdmins) {
      await io.notifyAdmins({
        type: "dispute",
        title: "🚨 New Dispute Raised",
        message: `User ${req.user.name || req.user.email} raised a dispute: ${category || 'other'}`,
        data: {
          bookingId: booking._id,
          disputeCategory: category,
          link: `/staff/disputes`,
        },
        priority: "high",
      });
    }

    // Notify mechanic
    if (booking.mechanic && io && io.createNotification) {
      await io.createNotification({
        recipient: booking.mechanic,
        type: "dispute",
        title: "⚠️ Dispute Raised",
        message: `A dispute has been raised for booking #${booking._id.toString().slice(-6)}`,
        data: {
          bookingId: booking._id,
          link: `/mechanic/booking/${booking._id}`,
        },
        priority: "high",
      });
    }

    res.json({
      success: true,
      message: "Dispute raised successfully. Our staff will review and contact you shortly.",
      dispute: booking.dispute,
    });
  } catch (error) {
    console.error("Raise dispute API error:", error);
    res.status(500).json({ success: false, error: "Failed to raise dispute" });
  }
});

// Get user's disputes
router.get("/api/disputes", async (req, res) => {
  try {
    const bookingsWithDisputes = await Booking.find({
      user: req.user._id,
      "dispute.isDisputed": true,
    })
      .populate("mechanic", "name email phone profileImage")
      .sort({ "dispute.raisedAt": -1 });

    const disputes = bookingsWithDisputes.map(booking => ({
      bookingId: booking._id,
      problemCategory: booking.problemCategory,
      mechanic: booking.mechanic,
      dispute: booking.dispute,
      bookingStatus: booking.status,
      createdAt: booking.createdAt,
    }));

    res.json({ success: true, disputes });
  } catch (error) {
    console.error("Get disputes API error:", error);
    res.status(500).json({ success: false, error: "Failed to load disputes" });
  }
});

// Get dispute categories
router.get("/api/dispute/categories", async (req, res) => {
  const categoryLabels = {
    poor_service_quality: "Poor Service Quality",
    fake_parts_used: "Fake/Non-genuine Parts Used",
    overcharging: "Overcharging/Hidden Fees",
    incomplete_work: "Incomplete Work",
    damage_to_vehicle: "Damage to Vehicle",
    unprofessional_behavior: "Unprofessional Behavior",
    delayed_service: "Delayed Service",
    wrong_diagnosis: "Wrong Diagnosis",
    other: "Other Issue",
  };

  res.json({
    success: true,
    categories: DISPUTE_CATEGORIES.map(cat => ({
      value: cat,
      label: categoryLabels[cat] || cat,
    })),
  });
});

// ==================== USER ANALYTICS ENDPOINT ====================
const analyticsService = require("../services/analyticsService")

// Get user's analytics data (problems, spending)
router.get("/api/analytics", async (req, res) => {
  try {
    const data = await analyticsService.getUserAnalytics(req.user._id)
    res.json({ success: true, data })
  } catch (error) {
    console.error("User analytics error:", error)
    res.status(500).json({ error: "Failed to fetch analytics data" })
  }
})

module.exports = router
