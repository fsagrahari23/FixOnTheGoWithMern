const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "service-request",      // New service request for mechanic
      "booking-accepted",     // Mechanic accepted booking
      "booking-started",      // Service started
      "booking-completed",    // Service completed
      "booking-cancelled",    // Booking cancelled
      "new-message",          // New chat message
      "payment-received",     // Payment received
      "mechanic-approval",    // Mechanic approval status (for admin)
      "emergency-request",    // Emergency service request
      "review-received",      // New review received
      "subscription-update",  // Subscription status change
      "system",               // System notifications
      "mechanic-nearby",      // Mechanic is nearby (for user)
      "towing-update",        // Towing status update
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    // Additional data related to the notification
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    amount: Number,
    link: String, // URL to redirect when notification is clicked
    meta: mongoose.Schema.Types.Mixed, // Any additional metadata
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    // Notifications expire after 30 days by default
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1 });

// Auto-delete expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create and emit notification
NotificationSchema.statics.createAndEmit = async function(io, notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  
  // Emit to the recipient via socket
  if (io) {
    io.to(notificationData.recipient.toString()).emit("notification", {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });
  }
  
  return notification;
};

// Static method to mark all as read for a user
NotificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

module.exports = mongoose.model("Notification", NotificationSchema);
