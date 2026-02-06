import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Clock,
  MapPin,
  CreditCard,
  MessageSquare,
  Wrench,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { cn } from "@/lib/utils";

// Get icon for notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case "service-request":
      return <Wrench className="w-4 h-4 text-orange-500" />;
    case "booking-accepted":
    case "booking-started":
    case "booking-completed":
      return <Check className="w-4 h-4 text-green-500" />;
    case "booking-cancelled":
      return <X className="w-4 h-4 text-red-500" />;
    case "emergency-request":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "payment-received":
      return <CreditCard className="w-4 h-4 text-emerald-500" />;
    case "new-message":
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "mechanic-nearby":
      return <MapPin className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

// Format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Notification item component
const NotificationItem = ({ notification, onRead, onDelete, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative p-3 rounded-lg cursor-pointer transition-all duration-200",
        notification.read
          ? "bg-transparent hover:bg-muted/50"
          : "bg-primary/5 hover:bg-primary/10",
        isHovered && "pr-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(notification)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className="flex gap-3 ml-2">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium line-clamp-1",
              notification.read ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.priority === "urgent" && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Urgent
              </Badge>
            )}
            {notification.priority === "high" && (
              <Badge variant="warning" className="text-xs px-1 py-0 bg-orange-500/20 text-orange-600">
                High
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons on hover */}
      {isHovered && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {!notification.read && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification._id);
              }}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Empty state component
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// Main notification center component
export function NotificationCenter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const { notifications, unreadCount, status } = useSelector(
    (state) => state.notifications
  );

  // Fetch notifications when opened
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
    }
  }, [isOpen, dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    
    // Navigate to link if available
    if (notification.data?.link) {
      setIsOpen(false);
      navigate(notification.data.link);
    }
  };

  // Filter notifications by type
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    if (activeTab === "service") {
      return ["service-request", "booking-accepted", "booking-started", "booking-completed", "booking-cancelled"].includes(n.type);
    }
    return true;
  });

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            `relative rounded-full transition-colors duration-200 ${
              unreadCount > 0 ? 'ring-2 ring-red-200 dark:ring-red-900 bg-red-50 dark:bg-red-900/10' : ''
            }`
          }
          aria-label={unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="service"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Service
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            <ScrollArea className="h-[400px]">
              {status === "loading" ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState 
                  message={
                    activeTab === "unread" 
                      ? "No unread notifications" 
                      : "No notifications yet"
                  } 
                />
              ) : (
                <div className="p-2 space-y-1">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenter;
