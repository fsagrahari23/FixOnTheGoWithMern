import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../libs/socket";
import {
  addRealtimeNotification,
  fetchNotifications,
  fetchUnreadCount,
} from "../store/slices/notificationSlice";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { popupNotifications, unreadCount } = useSelector((state) => state.notifications);
  
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const listenersAddedRef = useRef(false);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        // Auto-play might be blocked
        console.log("Could not play notification sound:", e);
      });
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title, options = {}) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/logo.png",
        badge: "/logo.png",
        ...options,
      });
      
      notification.onclick = () => {
        window.focus();
        if (options.data?.link) {
          window.location.href = options.data.link;
        }
        notification.close();
      };
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // Handle incoming socket notifications
  const handleNotification = useCallback(
    (notification) => {
      // Add to Redux store
      dispatch(addRealtimeNotification(notification));
      
      // Play sound for important notifications
      if (notification.priority === "high" || notification.priority === "urgent") {
        playSound();
      }
      
      // Show browser notification if tab is not focused
      if (document.hidden) {
        showBrowserNotification(notification.title, {
          body: notification.message,
          tag: notification._id,
          data: notification.data,
        });
      }
    },
    [dispatch, playSound, showBrowserNotification]
  );

  // Handle service request popup (special event for mechanics)
  const handleServiceRequestPopup = useCallback(
    (data) => {
      const notification = {
        _id: data._id || `service-${Date.now()}`,
        type: "service-request",
        title: data.title,
        message: data.message,
        data: {
          bookingId: data.bookingId,
          distance: data.distance,
          isPriority: data.isPriority,
          problemCategory: data.problemCategory,
          address: data.address,
          link: `/mechanic/booking/${data.bookingId}`,
        },
        priority: data.isPriority ? "urgent" : "high",
        createdAt: data.createdAt,
      };
      
      dispatch(addRealtimeNotification(notification));
      playSound();
      
      // Always show browser notification for service requests
      showBrowserNotification(notification.title, {
        body: `${notification.message}\nDistance: ${data.distance}km\nLocation: ${data.address}`,
        tag: notification._id,
        requireInteraction: true, // Keep it visible
        data: notification.data,
      });
    },
    [dispatch, playSound, showBrowserNotification]
  );

  // Setup socket listeners
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = getSocket();
    const socket = socketRef.current;

    // Authenticate socket connection
    socket.emit("authenticate", user._id);

    // Setup notification listeners only once
    if (!listenersAddedRef.current) {
      // General notification event
      socket.on("notification", handleNotification);
      
      // Special service request popup for mechanics
      socket.on("service-request-popup", handleServiceRequestPopup);
      
      // Booking status changes
      socket.on("booking-status-changed", (data) => {
        handleNotification({
          type: "booking-update",
          title: "Booking Updated",
          message: `Booking status changed to ${data.status}`,
          data: { bookingId: data.bookingId, link: `/booking/${data.bookingId}` },
          priority: "normal",
        });
      });

      listenersAddedRef.current = true;
    }

    // Fetch initial notifications
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());

    // Request notification permission
    requestNotificationPermission();

    return () => {
      if (listenersAddedRef.current) {
        socket.off("notification");
        socket.off("service-request-popup");
        socket.off("booking-status-changed");
        listenersAddedRef.current = false;
      }
    };
  }, [
    user?._id,
    dispatch,
    handleNotification,
    handleServiceRequestPopup,
    requestNotificationPermission,
  ]);

  // Context value
  const value = {
    socket: socketRef.current,
    popupNotifications,
    unreadCount,
    playSound,
    showBrowserNotification,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
