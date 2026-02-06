import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, Bell, MapPin, AlertTriangle, Clock } from "lucide-react";
import { dismissPopup } from "../../store/slices/notificationSlice";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

// Individual popup notification item
const PopupItem = ({ notification, onDismiss, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto-dismiss after 10 seconds for non-urgent notifications
    const autoDismissTimer = notification.priority !== "urgent" 
      ? setTimeout(() => handleDismiss(), 10000)
      : null;

    return () => {
      clearTimeout(timer);
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification._id), 300);
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "urgent":
        return "border-red-500 bg-red-500/10";
      case "high":
        return "border-orange-500 bg-orange-500/10";
      default:
        return "border-blue-500 bg-blue-500/10";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "service-request":
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case "booking-accepted":
      case "booking-started":
      case "booking-completed":
        return <Bell className="w-6 h-6 text-green-500" />;
      case "emergency-request":
        return <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div
      className={cn(
        "relative w-96 max-w-[calc(100vw-2rem)] rounded-lg border-l-4 shadow-lg backdrop-blur-sm transition-all duration-300",
        getPriorityColor(),
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {/* Urgency indicator for urgent notifications */}
      {notification.priority === "urgent" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse rounded-t-lg" />
      )}

      <div className="p-4 bg-card/95">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{notification.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Additional info for service requests */}
        {notification.type === "service-request" && notification.data && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {notification.data.distance && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{notification.data.distance}km away</span>
              </div>
            )}
            {notification.data.address && (
              <div className="text-sm text-muted-foreground truncate">
                📍 {notification.data.address}
              </div>
            )}
            {notification.data.isPriority && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-medium rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Priority Request
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {notification.data?.link && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onAction(notification);
                handleDismiss();
              }}
            >
              {notification.type === "service-request" ? "View Request" : "View Details"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Dismiss
          </Button>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// Main popup container
export function NotificationPopup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { popupNotifications } = useSelector((state) => state.notifications);

  const handleDismiss = (id) => {
    dispatch(dismissPopup(id));
  };

  const handleAction = (notification) => {
    if (notification.data?.link) {
      navigate(notification.data.link);
    }
  };

  if (popupNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      {popupNotifications.slice(0, 3).map((notification) => (
        <PopupItem
          key={notification._id}
          notification={notification}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />
      ))}
      
      {popupNotifications.length > 3 && (
        <div className="text-center text-sm text-muted-foreground bg-card/90 rounded-lg py-2 px-4 shadow">
          +{popupNotifications.length - 3} more notifications
        </div>
      )}
    </div>
  );
}

export default NotificationPopup;
