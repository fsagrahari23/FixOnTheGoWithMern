const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const isAuthenticated = authMiddleware.isAuthenticated;
const authMiddleware = require("../middleware/auth");
router.use(authMiddleware.isAuthenticated);
const User = require("../models/User");
const GeneralChat = require("../models/GeneralChat");
const Notification = require("../models/Notification");
const { sendSupportResponseToUser } = require("../services/emailService");

// All routes require staff authentication
// Password change route (accessible even with mustChangePassword = true)
router.post("/change-password", staffController.changePassword);

// Routes below require password to be changed first
router.use(authMiddleware.isAuthenticated);
// Dashboard
router.get("/dashboard", staffController.getDashboardData);

// ==================== SUPPORT CHAT ROUTES ====================
// Get all support chats for staff
router.get("/chats", async (req, res) => {
  try {
    const chats = await GeneralChat.find({
      participants: req.user._id,
    })
      .populate("participants", "name role email phone profileImage")
      .sort({ lastActivity: -1 });

    // Get unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(
        msg => !msg.read && msg.sender.toString() !== req.user._id.toString()
      ).length;
      return {
        ...chat.toObject(),
        unreadCount,
      };
    });

    res.json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    console.error("Get staff chats error:", error);
    res.status(500).json({ success: false, error: "Failed to get chats" });
  }
});

// Get specific chat messages
router.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await GeneralChat.findById(req.params.chatId)
      .populate("participants", "name role email phone profileImage")
      .populate("messages.sender", "name role profileImage");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if staff is a participant
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

    // Get the user (other participant)
    const user = chat.participants.find(p => p.role !== "staff");

    res.json({ 
      success: true, 
      chat,
      messages: chat.messages,
      user,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({ success: false, error: "Failed to get messages" });
  }
});

// Send message in chat
router.post("/chat/:chatId/send", async (req, res) => {
  try {
    const { message, attachments } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const chat = await GeneralChat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Check if staff is a participant
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

    // Get the recipient (user)
    const recipientId = chat.participants.find(p => p.toString() !== req.user._id.toString());
    const recipient = await User.findById(recipientId);

    // Emit socket event for real-time message
    const io = req.app.get("io");
    if (io) {
      // Emit to chat room
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

      // Also emit directly to user
      io.to(recipientId.toString()).emit("new-staff-message", {
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

      // Create notification for user
      await Notification.createAndEmit(io, {
        recipient: recipientId,
        type: "user-message",
        title: "📩 Support Response",
        message: `${req.user.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        data: {
          chatId: chat._id,
          staffId: req.user._id,
          link: `/user/support`,
        },
        priority: "normal",
      });
    }

    res.json({ success: true, message: "Message sent", newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// Send email response to user
router.post("/email/respond", async (req, res) => {
  try {
    const { userId, message, subject } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "User ID and message are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send email
    const emailResult = await sendSupportResponseToUser(
      user.email,
      user.name,
      req.user.name,
      message
    );

    // Create notification for user
    const io = req.app.get("io");
    if (io) {
      await Notification.createAndEmit(io, {
        recipient: userId,
        type: "email-received",
        title: "📧 Support Email Response",
        message: `${req.user.name} responded to your support request`,
        data: {
          staffId: req.user._id,
          subject: subject || "Support Response",
          link: `/user/support`,
        },
        priority: "normal",
      });
    }

    res.json({ success: true, message: "Email sent", emailResult });
  } catch (error) {
    console.error("Send email response error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Get all support requests (unread chats)
router.get("/support-requests", async (req, res) => {
  try {
    const chats = await GeneralChat.find({
      participants: req.user._id,
    })
      .populate("participants", "name role email phone profileImage")
      .sort({ lastActivity: -1 });

    // Filter chats with unread messages
    const unreadChats = chats.filter(chat => {
      return chat.messages.some(
        msg => !msg.read && msg.sender.toString() !== req.user._id.toString()
      );
    }).map(chat => {
      const unreadCount = chat.messages.filter(
        msg => !msg.read && msg.sender.toString() !== req.user._id.toString()
      ).length;
      const lastMessage = chat.messages[chat.messages.length - 1];
      const user = chat.participants.find(p => p.role !== "staff");
      return {
        _id: chat._id,
        user,
        unreadCount,
        lastMessage,
        lastActivity: chat.lastActivity,
      };
    });

    res.json({ success: true, requests: unreadChats });
  } catch (error) {
    console.error("Get support requests error:", error);
    res.status(500).json({ success: false, error: "Failed to get support requests" });
  }
});

// Mechanic management
router.get("/mechanics/pending", staffController.getPendingMechanics);
router.get("/mechanic/:id", staffController.getMechanicDetails);
router.post("/mechanic/:id/approve", staffController.approveMechanic);
router.post("/mechanic/:id/reject", staffController.rejectMechanic);

// Dispute/Conflict resolution
router.get("/disputes", staffController.getDisputedBookings);
router.get("/booking/:id", staffController.getBookingDetails);
router.post("/dispute/:id/resolve", staffController.resolveDispute);
router.post("/booking/:id/flag", staffController.flagBookingDispute);

// Bookings
router.get("/bookings", staffController.getAllBookings);

// Payments
router.get("/payments", staffController.getPayments);
router.get("/payment/:id", staffController.getPaymentDetails);

module.exports = router;
