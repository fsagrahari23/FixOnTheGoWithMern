const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Booking = require("../models/Booking");
const cloudinary = require("../config/cloudinary");

/* ------------------------------------------------------------------
   1️⃣ GET CHAT USING BOOKING ID  
   Returns: chatId, booking, chat, user
-------------------------------------------------------------------- */
router.get("/:bookingId/messages", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "name")
      .populate("mechanic", "name");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = req.user._id.toString();

    // Validate user
    if (
      booking.user._id.toString() !== userId &&
      booking.mechanic?._id.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Find or create chat
    let chat = await Chat.findOne({ booking: booking._id });

    if (!chat && booking.mechanic) {
      chat = await Chat.findOne({
        participants: { $all: [booking.user._id, booking.mechanic._id] },
      });
    }

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

    // Mark unread messages as read
    let updated = false;
    chat.messages.forEach((msg) => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) await chat.save();

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      booking,
      chat,
      user: req.user,
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   2️⃣ SEND MESSAGE USING CHAT ID
-------------------------------------------------------------------- */
router.post("/:chatId/send", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message && (!req.files || !req.files.attachment)) {
      return res.status(400).json({
        success: false,
        message: "Message or attachment is required",
      });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Validate participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Upload attachments (if any)
    const attachments = [];
    if (req.files && req.files.attachment) {
      const files = Array.isArray(req.files.attachment)
        ? req.files.attachment
        : [req.files.attachment];

      for (const file of files) {
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: "auto",
        });

        attachments.push({
          url: uploaded.secure_url,
          contentType: file.mimetype,
        });
      }
    }

    // Save message
    chat.messages.push({
      sender: req.user._id,
      content: message || "Sent an attachment",
      timestamp: new Date(),
      read: false,
      attachments,
    });

    chat.lastActivity = new Date();
    await chat.save();

    return res.status(200).json({
      success: true,
      message: "Message sent",
    });

  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   3️⃣ GET ALL MESSAGES IN A CHAT (using chatId)
-------------------------------------------------------------------- */
router.get("/:chatId/all", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "messages.sender",
      "name role"
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Validate participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Mark messages as read
    let updated = false;
    chat.messages.forEach((msg) => {
      if (msg.sender._id.toString() !== req.user._id.toString() && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) await chat.save();

    return res.status(200).json({
      success: true,
      messages: chat.messages,
    });

  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   4️⃣ GET UNREAD MESSAGE COUNT
-------------------------------------------------------------------- */
router.get("/unread/count", async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    });

    let unreadCount = 0;

    chats.forEach((chat) => {
      chat.messages.forEach((msg) => {
        if (msg.sender.toString() !== req.user._id.toString() && !msg.read) {
          unreadCount++;
        }
      });
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });

  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
