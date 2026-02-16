const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { isAuthenticated } = require("../middleware/auth");

// Get all notifications for the authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    
    const query = { recipient: req.user._id };
    
    if (unreadOnly === "true") {
      query.read = false;
    }
    
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// Get unread notification count
router.get("/unread-count", isAuthenticated, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ success: true, count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Failed to get unread count" });
  }
});

// Mark a single notification as read
router.patch("/:id/read", isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", isAuthenticated, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
});

// Delete a single notification
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

// Delete all notifications (or only read ones)
router.delete("/", isAuthenticated, async (req, res) => {
  try {
    const { readOnly = false } = req.query;
    
    const query = { recipient: req.user._id };
    if (readOnly === "true") {
      query.read = true;
    }
    
    await Notification.deleteMany(query);
    res.json({ success: true, message: "Notifications deleted" });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notifications" });
  }
});

module.exports = router;
