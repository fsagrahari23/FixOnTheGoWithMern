const Chat = require("./models/Chat");
const User = require("./models/User");
const Booking = require("./models/Booking");
const Notification = require("./models/Notification");

// Helper function to create and emit notification
const createNotification = async (io, notificationData) => {
  try {
    return await Notification.createAndEmit(io, notificationData);
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Helper to notify nearby mechanics about new service request
const notifyNearbyMechanics = async (io, booking, onlineUsers) => {
  try {
    // Find mechanics within 10km radius
    const nearbyMechanics = await User.aggregate([
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
          isActive: true,
        },
      },
      {
        $limit: 20,
      },
    ]);

    const bookingUser = await User.findById(booking.user).select("name");

    // Create notification for each nearby mechanic
    for (const mechanic of nearbyMechanics) {
      const notification = await createNotification(io, {
        recipient: mechanic._id,
        type: "service-request",
        title: "🔔 New Service Request!",
        message: `${bookingUser?.name || "A user"} needs help with ${booking.problemCategory}. Distance: ${(mechanic.distance / 1000).toFixed(1)}km`,
        data: {
          bookingId: booking._id,
          userId: booking.user,
          link: `/mechanic/booking/${booking._id}`,
          meta: {
            problemCategory: booking.problemCategory,
            distance: mechanic.distance,
            isPriority: booking.isPriority,
            requiresTowing: booking.requiresTowing,
          },
        },
        priority: booking.isPriority ? "urgent" : "high",
      });

      // Also emit a popup notification event for immediate display
      if (onlineUsers[mechanic._id.toString()]) {
        io.to(mechanic._id.toString()).emit("service-request-popup", {
          _id: notification?._id,
          bookingId: booking._id,
          title: "🔔 New Service Request!",
          message: `${bookingUser?.name || "A user"} needs help with ${booking.problemCategory}`,
          distance: (mechanic.distance / 1000).toFixed(1),
          isPriority: booking.isPriority,
          problemCategory: booking.problemCategory,
          address: booking.location.address,
          createdAt: new Date(),
        });
      }
    }

    console.log(`Notified ${nearbyMechanics.length} mechanics about new booking`);
  } catch (error) {
    console.error("Error notifying nearby mechanics:", error);
  }
};

// Helper to notify admins about important events
const notifyAdmins = async (io, notificationData) => {
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");

    for (const admin of admins) {
      await createNotification(io, {
        ...notificationData,
        recipient: admin._id,
      });
    }
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

module.exports = (io) => {
  // Store online users
  const onlineUsers = {};
  // In-memory path store per booking for live tracking line
  const bookingTrackingPaths = new Map();
  const userLocationPersistTimestamps = new Map();

  const isValidGeoCoordinates = (coordinates) => {
    return (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      Number.isFinite(coordinates[0]) &&
      Number.isFinite(coordinates[1])
    );
  };

  const appendTrackingPoint = (bookingId, coordinates) => {
    if (!isValidGeoCoordinates(coordinates)) return [];

    const key = bookingId.toString();
    const previous = bookingTrackingPaths.get(key) || [];
    const last = previous[previous.length - 1];

    if (last && last[0] === coordinates[0] && last[1] === coordinates[1]) {
      return previous;
    }

    const next = [...previous, coordinates];
    // Cap path points to keep memory bounded
    const bounded = next.length > 300 ? next.slice(next.length - 300) : next;
    bookingTrackingPaths.set(key, bounded);
    return bounded;
  };

  const shouldPersistLocation = (userId, minIntervalMs = 5000) => {
    const key = userId?.toString();
    if (!key) return false;

    const now = Date.now();
    const lastPersistedAt = userLocationPersistTimestamps.get(key) || 0;
    if (now - lastPersistedAt < minIntervalMs) {
      return false;
    }

    userLocationPersistTimestamps.set(key, now);
    return true;
  };

  // Make helper functions available via io for use in routes
  io.notifyNearbyMechanics = (booking) => notifyNearbyMechanics(io, booking, onlineUsers);
  io.notifyAdmins = (notificationData) => notifyAdmins(io, notificationData);
  io.createNotification = (notificationData) => createNotification(io, notificationData);
  io.getOnlineUsers = () => onlineUsers;

  io.on("connection", (socket) => {
    console.log("Backend: New client connected");

    socket.on("authenticate", async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          socket.userId = userId;
          onlineUsers[userId] = socket.id;
          // join a room named after the userId so server can emit directly to this user
          try { socket.join(userId); } catch { /* no-op */ }
          console.log(`User ${userId} authenticated`);

          // Notify relevant users that this user is online
          if (user.role === "mechanic") {
            // Find all bookings where this mechanic is assigned
            const bookings = await Booking.find({
              mechanic: userId,
              status: { $in: ["accepted", "in-progress"] },
            });

            // Notify all users with active bookings with this mechanic
            bookings.forEach((booking) => {
              if (onlineUsers[booking.user.toString()]) {
                io.to(onlineUsers[booking.user.toString()]).emit(
                  "mechanic-online",
                  {
                    mechanicId: userId,
                    bookingId: booking._id,
                  }
                );
              }
            });
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
    });

    // Join a chat room
    socket.on("join-chat", async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(chatId);
          console.log(`User ${socket.userId} joined chat ${chatId}`);
        }
      } catch (error) {
        console.error("Join chat error:", error);
      }
    });

    // Typing Indicators
    socket.on("typing", (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("typing-status", {
        chatId,
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on("stop-typing", (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("typing-status", {
        chatId,
        userId: socket.userId,
        isTyping: false
      });
    });

    // Join a general chat room
    socket.on("join-general-chat", async (chatId) => {
      try {
        const chat = await GeneralChat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(`general-${chatId}`);
          console.log(`User ${socket.userId} joined general chat ${chatId}`);
        }
      } catch (error) {
        console.error("Join general chat error:", error);
      }
    });

    // Send a message
    socket.on("send-message", async (data) => {
      try {
        const { chatId, content, attachments } = data;

        // Save message to database
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          const newMessage = {
            sender: socket.userId,
            content,
            timestamp: new Date(),
            read: false,
            attachments: attachments || [],
          };

          chat.messages.push(newMessage);
          chat.lastActivity = new Date();
          chat.updatedAt = new Date();
          await chat.save();

          // Get sender info for the message
          const sender = await User.findById(socket.userId).select("name role");

          // Broadcast to all users in the chat room
          io.to(chatId).emit("new-message", {
            chatId,
            message: {
              ...newMessage,
              sender: {
                _id: socket.userId,
                name: sender.name,
                role: sender.role,
              },
            },
          });

          // Send notification to offline participants
          chat.participants.forEach((participantId) => {
            if (
              participantId.toString() !== socket.userId &&
              !onlineUsers[participantId.toString()]
            ) {
              // Here you would implement push notifications or other notification methods
              console.log(`Should notify offline user ${participantId}`);
            }
          });
        }
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    // Send a message in general chat
    socket.on("send-general-message", async (data) => {
      try {
        const { chatId, content, attachments } = data;

        // Save message to database
        const chat = await GeneralChat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          const newMessage = {
            sender: socket.userId,
            content,
            timestamp: new Date(),
            read: false,
            attachments: attachments || [],
          };

          chat.messages.push(newMessage);
          chat.lastActivity = new Date();
          chat.updatedAt = new Date();
          await chat.save();

          // Get sender info for the message
          const sender = await User.findById(socket.userId).select("name role");

          // Broadcast to all users in the general chat room
          io.to(`general-${chatId}`).emit("new-general-message", {
            chatId,
            message: {
              ...newMessage,
              sender: {
                _id: socket.userId,
                name: sender.name,
                role: sender.role,
              },
            },
          });

          // Send notification to offline participants
          chat.participants.forEach((participantId) => {
            if (
              participantId.toString() !== socket.userId &&
              !onlineUsers[participantId.toString()]
            ) {
              // Here you would implement push notifications or other notification methods
              console.log(`Should notify offline user ${participantId}`);
            }
          });
        }
      } catch (error) {
        console.error("Send general message error:", error);
      }
    });

    // Mark message as read
    socket.on("mark-read", async (data) => {
      try {
        const { chatId, messageId } = data;

        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          const message = chat.messages.id(messageId);
          if (
            message &&
            message.sender.toString() !== socket.userId &&
            !message.read
          ) {
            message.read = true;
            await chat.save();

            // Notify sender that message was read
            const senderId = message.sender.toString();
            if (onlineUsers[senderId]) {
              io.to(onlineUsers[senderId]).emit("message-read", {
                chatId,
                messageId,
              });
            }
          }
        }
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    // Mark general message as read
    socket.on("mark-general-read", async (data) => {
      try {
        const { chatId, messageId } = data;

        const chat = await GeneralChat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          const message = chat.messages.id(messageId);
          if (
            message &&
            message.sender.toString() !== socket.userId &&
            !message.read
          ) {
            message.read = true;
            await chat.save();

            // Notify sender that message was read
            const senderId = message.sender.toString();
            if (onlineUsers[senderId]) {
              io.to(onlineUsers[senderId]).emit("general-message-read", {
                chatId,
                messageId,
              });
            }
          }
        }
      } catch (error) {
        console.error("Mark general read error:", error);
      }
    });

    // Booking status updates
    socket.on("booking-update", async (data) => {
      try {
        const { bookingId, status } = data;
        const booking = await Booking.findById(bookingId);

        if (booking) {
          // Check if the user is authorized to update this booking
          if (
            (socket.userId === booking.user.toString() &&
              status === "cancelled") ||
            (socket.userId === booking.mechanic.toString() &&
              ["accepted", "in-progress", "completed"].includes(status)) ||
            (await User.findById(socket.userId)).role === "admin"
          ) {
            booking.status = status;
            booking.updatedAt = new Date();
            await booking.save();

            // Notify relevant users
            const notifyUsers = [booking.user.toString()];
            if (booking.mechanic) {
              notifyUsers.push(booking.mechanic.toString());
            }

            notifyUsers.forEach((userId) => {
              if (onlineUsers[userId]) {
                io.to(onlineUsers[userId]).emit("booking-status-changed", {
                  bookingId,
                  status,
                  updatedAt: booking.updatedAt,
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Booking update error:", error);
      }
    });

    // Towing status updates
    socket.on("towing-update", async (data) => {
      try {
        const { bookingId, status } = data;
        const booking = await Booking.findById(bookingId);

        if (booking && booking.requiresTowing) {
          // Check if the user is authorized to update towing status
          if (
            socket.userId === booking.mechanic.toString() ||
            (await User.findById(socket.userId)).role === "admin"
          ) {
            booking.towingDetails.status = status;
            booking.updatedAt = new Date();
            await booking.save();

            // Notify relevant users
            const notifyUsers = [booking.user.toString()];
            if (booking.mechanic) {
              notifyUsers.push(booking.mechanic.toString());
            }

            notifyUsers.forEach((userId) => {
              if (onlineUsers[userId]) {
                io.to(onlineUsers[userId]).emit("towing-status-changed", {
                  bookingId,
                  status,
                  updatedAt: booking.updatedAt,
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Towing update error:", error);
      }
    });

    // ==================== MECHANIC LOCATION UPDATES ====================
    // Real-time mechanic location update for nearby users (Uber/Rapido style)
    socket.on("mechanic-location-update", async (data) => {
      try {
        const { coordinates, bookingId } = data; // [longitude, latitude]

        if (!socket.userId || !coordinates || coordinates.length !== 2) {
          return;
        }

        const user = await User.findById(socket.userId);
        if (!user || user.role !== "mechanic") {
          return;
        }

        const lastSeen = new Date();

        // Persist less frequently to avoid DB bottlenecks during high-frequency tracking.
        if (shouldPersistLocation(socket.userId, 5000)) {
          user.location.coordinates = coordinates;
          user.lastSeen = lastSeen;
          await user.save();
        }

        // console.log(`Mechanic ${socket.userId} location updated:`, coordinates);

        // Broadcast to all connected users watching nearby mechanics
        // Users subscribe to "watch-nearby-mechanics" room
        io.to("nearby-mechanics-watchers").emit("mechanic-location-changed", {
          mechanicId: socket.userId,
          name: user.name,
          profileImage: user.profileImage,
          coordinates,
          lastSeen,
        });

        // Also notify users with active bookings with this mechanic
        const activeBookings = await Booking.find({
          mechanic: socket.userId,
          status: { $in: ["accepted", "in-progress"] },
        });

        const relevantBookings = bookingId
          ? activeBookings.filter((b) => b._id.toString() === bookingId.toString())
          : activeBookings;

        relevantBookings.forEach((booking) => {
          const pathCoordinates = appendTrackingPoint(booking._id, coordinates);

          const trackingPayload = {
            bookingId: booking._id,
            mechanicId: socket.userId,
            mechanicName: user.name,
            mechanicCoordinates: coordinates,
            userCoordinates: booking.location?.coordinates || null,
            pathCoordinates,
            updatedAt: new Date(),
          };

          io.to(`booking-${booking._id}-tracking`).emit("booking-tracking-update", trackingPayload);

          const userId = booking.user.toString();
          if (onlineUsers[userId]) {
            io.to(onlineUsers[userId]).emit("assigned-mechanic-location", {
              bookingId: booking._id,
              mechanicId: socket.userId,
              mechanicName: user.name,
              coordinates,
              userCoordinates: booking.location?.coordinates || null,
              pathCoordinates,
              lastSeen,
            });
          }
        });
      } catch (error) {
        console.error("Mechanic location update error:", error);
      }
    });

    // Real-time user/customer location update
    socket.on("update-location", async (data) => {
      try {
        const { coordinates, bookingId } = data || {}; // [longitude, latitude]
        if (!socket.userId || !coordinates || coordinates.length !== 2) return;

        const user = await User.findById(socket.userId);
        if (!user) return;

        const lastSeen = new Date();

        // Persist less frequently to avoid DB bottlenecks during high-frequency tracking.
        if (shouldPersistLocation(socket.userId, 5000)) {
          user.location.coordinates = coordinates;
          user.lastSeen = lastSeen;
          await user.save();
        }

        // Notify mechanics of active bookings about user's new location
        const activeBookings = await Booking.find({
          user: socket.userId,
          status: { $in: ["accepted", "in-progress"] },
        });

        const relevantBookings = bookingId
          ? activeBookings.filter((b) => b._id.toString() === bookingId.toString())
          : activeBookings;

        relevantBookings.forEach((booking) => {
          io.to(`booking-${booking._id}-tracking`).emit("booking-tracking-update", {
            bookingId: booking._id,
            userCoordinates: coordinates,
            updatedAt: new Date(),
          });
        });

      } catch (error) {
        console.error("User location update error:", error);
      }
    });

    // Join booking-specific tracking room for user/mechanic
    socket.on("join-booking-tracking", async (data) => {
      try {
        const { bookingId } = data || {};
        if (!bookingId || !socket.userId) return;

        const booking = await Booking.findById(bookingId)
          .populate("mechanic", "name location")
          .populate("user", "name location");

        if (!booking) return;

        const isOwner = booking.user?._id?.toString() === socket.userId;
        const isAssignedMechanic = booking.mechanic?._id?.toString() === socket.userId;
        const requester = await User.findById(socket.userId).select("role");
        const isPrivileged = requester && ["admin", "staff"].includes(requester.role);

        if (!isOwner && !isAssignedMechanic && !isPrivileged) {
          return;
        }

        socket.join(`booking-${bookingId}-tracking`);

        const initialPath = bookingTrackingPaths.get(bookingId.toString()) || [];
        const mechanicCoordinates = booking.mechanic?.location?.coordinates || null;

        if (isValidGeoCoordinates(mechanicCoordinates) && initialPath.length === 0) {
          appendTrackingPoint(bookingId, mechanicCoordinates);
        }

        socket.emit("booking-tracking-snapshot", {
          bookingId,
          mechanicId: booking.mechanic?._id || null,
          mechanicName: booking.mechanic?.name || null,
          mechanicCoordinates,
          userCoordinates: booking.user?.location?.coordinates || booking.location?.coordinates || null,
          pathCoordinates: bookingTrackingPaths.get(bookingId.toString()) || [],
          updatedAt: booking.updatedAt,
        });
      } catch (error) {
        console.error("Join booking tracking error:", error);
      }
    });

    socket.on("leave-booking-tracking", (data) => {
      const { bookingId } = data || {};
      if (!bookingId) return;
      socket.leave(`booking-${bookingId}-tracking`);
    });

    // User subscribes to watch nearby mechanics (for dashboard/booking)
    socket.on("watch-nearby-mechanics", async (data) => {
      try {
        socket.join("nearby-mechanics-watchers");
        console.log(`User ${socket.userId || 'anonymous'} started watching nearby mechanics`);

        // Send initial list of online mechanics
        const { lat, lng, radius = 10000 } = data || {};

        if (lat && lng) {
          const nearbyMechanics = await User.aggregate([
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                distanceField: "distance",
                maxDistance: parseInt(radius),
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
              $project: {
                _id: 1,
                name: 1,
                location: 1,
                lastSeen: 1,
                profileImage: 1,
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
            { $limit: 50 },
          ]);

          const mechanicsWithStatus = nearbyMechanics.map(m => ({
            mechanicId: m._id,
            name: m.name,
            profileImage: m.profileImage,
            coordinates: m.location?.coordinates,
            isOnline: !!onlineUsers[m._id.toString()],
            distance: m.distance,
            distanceKm: (m.distance / 1000).toFixed(1),
            lastSeen: m.lastSeen,
            profile: {
              rating: m.profile?.rating || 0,
              specialization: m.profile?.specialization || [],
            }
          }));

          socket.emit("nearby-mechanics-list", {
            mechanics: mechanicsWithStatus,
          });
        }
      } catch (error) {
        console.error("Watch nearby mechanics error:", error);
      }
    });

    // Stop watching nearby mechanics
    socket.on("stop-watching-mechanics", () => {
      socket.leave("nearby-mechanics-watchers");
      console.log(`User ${socket.userId || 'anonymous'} stopped watching nearby mechanics`);
    });

    // Request mechanic's current location (for users with active bookings)
    socket.on("request-mechanic-location", async (data) => {
      try {
        const { bookingId } = data;

        if (!bookingId) return;

        const booking = await Booking.findById(bookingId).populate("mechanic", "name location lastSeen");

        if (!booking || booking.user.toString() !== socket.userId) {
          return;
        }

        if (booking.mechanic) {
          socket.emit("mechanic-current-location", {
            bookingId,
            mechanicId: booking.mechanic._id,
            mechanicName: booking.mechanic.name,
            coordinates: booking.mechanic.location?.coordinates,
            isOnline: !!onlineUsers[booking.mechanic._id.toString()],
            lastSeen: booking.mechanic.lastSeen,
          });
        }
      } catch (error) {
        console.error("Request mechanic location error:", error);
      }
    });

    // ==================== STAFF CHAT EVENTS ====================
    // Join a staff support chat room
    socket.on("join-staff-chat", async (chatId) => {
      try {
        const GeneralChat = require("./models/GeneralChat");
        const chat = await GeneralChat.findById(chatId);

        if (chat && chat.participants.some(p => p.toString() === socket.userId)) {
          socket.join(`staff-chat-${chatId}`);
          console.log(`User ${socket.userId} joined staff chat ${chatId}`);
        }
      } catch (error) {
        console.error("Join staff chat error:", error);
      }
    });

    // Leave staff chat room
    socket.on("leave-staff-chat", (chatId) => {
      socket.leave(`staff-chat-${chatId}`);
      console.log(`User ${socket.userId} left staff chat ${chatId}`);
    });

    // Send message in staff chat (real-time)
    socket.on("send-staff-message", async (data) => {
      try {
        const { chatId, content, attachments } = data;
        const GeneralChat = require("./models/GeneralChat");

        const chat = await GeneralChat.findById(chatId);
        if (!chat || !chat.participants.some(p => p.toString() === socket.userId)) {
          return;
        }

        const newMessage = {
          sender: socket.userId,
          content,
          timestamp: new Date(),
          read: false,
          attachments: attachments || [],
        };

        chat.messages.push(newMessage);
        chat.lastActivity = new Date();
        chat.updatedAt = new Date();
        await chat.save();

        // Get sender info
        const sender = await User.findById(socket.userId).select("name role profileImage");

        // Broadcast to all users in this chat room
        io.to(`staff-chat-${chatId}`).emit("new-staff-message", {
          chatId,
          message: {
            ...newMessage,
            sender: {
              _id: socket.userId,
              name: sender.name,
              role: sender.role,
              profileImage: sender.profileImage,
            },
          },
        });

        // Send notification to other participant
        const recipientId = chat.participants.find(p => p.toString() !== socket.userId);
        if (recipientId) {
          const notificationType = sender.role === "staff" ? "user-message" : "staff-message";

          await createNotification(io, {
            recipient: recipientId,
            type: notificationType,
            title: sender.role === "staff" ? "📩 Support Response" : "📩 New Support Message",
            message: `${sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            data: {
              chatId: chat._id,
              senderId: socket.userId,
              link: sender.role === "staff" ? `/user/support` : `/staff/chat/${chatId}`,
            },
            priority: "normal",
          });

          // Also emit directly to recipient if online
          if (onlineUsers[recipientId.toString()]) {
            io.to(recipientId.toString()).emit("new-staff-message", {
              chatId,
              message: {
                ...newMessage,
                sender: {
                  _id: socket.userId,
                  name: sender.name,
                  role: sender.role,
                  profileImage: sender.profileImage,
                },
              },
            });
          }
        }
      } catch (error) {
        console.error("Send staff message error:", error);
      }
    });

    // Mark staff chat message as read
    socket.on("mark-staff-message-read", async (data) => {
      try {
        const { chatId, messageId } = data;
        const GeneralChat = require("./models/GeneralChat");

        const chat = await GeneralChat.findById(chatId);
        if (!chat || !chat.participants.some(p => p.toString() === socket.userId)) {
          return;
        }

        const message = chat.messages.id(messageId);
        if (message && message.sender.toString() !== socket.userId && !message.read) {
          message.read = true;
          await chat.save();

          // Notify sender that message was read
          const senderId = message.sender.toString();
          if (onlineUsers[senderId]) {
            io.to(onlineUsers[senderId]).emit("staff-message-read", {
              chatId,
              messageId,
            });
          }
        }
      } catch (error) {
        console.error("Mark staff message read error:", error);
      }
    });

    // Typing indicator for staff chat
    socket.on("staff-chat-typing", (data) => {
      const { chatId, isTyping } = data;
      socket.to(`staff-chat-${chatId}`).emit("staff-chat-user-typing", {
        chatId,
        userId: socket.userId,
        isTyping,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        // Notify watchers that this mechanic went offline
        User.findById(socket.userId).then(user => {
          if (user && user.role === "mechanic") {
            io.to("nearby-mechanics-watchers").emit("mechanic-offline", {
              mechanicId: socket.userId,
            });
          }
        }).catch(() => { });

        delete onlineUsers[socket.userId];
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};
