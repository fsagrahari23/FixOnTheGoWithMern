"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  MessageCircle,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Wrench,
  User,
  X,
  Loader2,
  MailCheck
} from "lucide-react"
import { toast } from "sonner"
import { getSocket } from "../../../libs/socket"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

// Notification type icons
const notificationIcons = {
  "new-booking": <Wrench className="h-4 w-4 text-blue-500" />,
  "booking-accepted": <CheckCircle className="h-4 w-4 text-green-500" />,
  "booking-completed": <CheckCircle className="h-4 w-4 text-green-600" />,
  "booking-cancelled": <X className="h-4 w-4 text-red-500" />,
  "payment-received": <CreditCard className="h-4 w-4 text-green-500" />,
  "chat-message": <MessageCircle className="h-4 w-4 text-blue-500" />,
  "staff-message": <MessageCircle className="h-4 w-4 text-purple-500" />,
  "user-message": <MessageCircle className="h-4 w-4 text-blue-500" />,
  "email-received": <Mail className="h-4 w-4 text-orange-500" />,
  "dispute-update": <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  "dispute-assigned": <AlertTriangle className="h-4 w-4 text-orange-500" />,
  "support-request": <User className="h-4 w-4 text-blue-500" />,
  "subscription": <MailCheck className="h-4 w-4 text-purple-500" />,
  "system": <Bell className="h-4 w-4 text-gray-500" />,
}

const getNotificationIcon = (type) => {
  return notificationIcons[type] || notificationIcons["system"]
}

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)
  const navigate = useNavigate()
  const socket = getSocket()
  const { user } = useSelector((state) => state.auth)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Fetch notifications error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [fetchNotifications, user])

  // Socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show toast for important notifications
      if (!notification.read) {
        toast.info(notification.title, {
          description: notification.message,
        })
      }
    }

    socket.on("notification", handleNewNotification)

    return () => {
      socket.off("notification", handleNewNotification)
    }
  }, [socket])

  // Mark all as read
  const handleMarkAllRead = async () => {
    setMarkingRead(true)
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error("Mark read error:", error)
      toast.error("Failed to mark notifications as read")
    } finally {
      setMarkingRead(false)
    }
  }

  // Mark single notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      })
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error("Mark read error:", error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    handleMarkRead(notification._id)
    setOpen(false)

    // Navigate based on notification type
    const type = notification.type
    const data = notification.data || {}

    if (type.includes("booking")) {
      navigate(`/bookings/${data.bookingId || ""}`)
    } else if (type.includes("chat") || type.includes("message")) {
      if (user?.role === "staff") {
        navigate(`/staff/chat/${data.chatId || ""}`)
      } else {
        navigate(`/support/chat/${data.chatId || ""}`)
      }
    } else if (type.includes("dispute")) {
      navigate(`/disputes/${data.disputeId || ""}`)
    } else if (type.includes("payment")) {
      navigate(`/payments`)
    } else if (type === "support-request") {
      navigate(`/staff/chats`)
    }
  }

  // Clear notification
  const handleClearNotification = async (e, notificationId) => {
    e.stopPropagation()
    try {
      await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      })
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error) {
      console.error("Delete notification error:", error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center"
              >
                <span className="text-[10px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingRead}
              className="h-auto py-1 px-2 text-xs"
            >
              {markingRead ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Mark all read"
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="py-1">
              <AnimatePresence initial={false}>
                {notifications.slice(0, 20).map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <DropdownMenuItem
                      className={`flex items-start gap-3 p-3 cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                        onClick={(e) => handleClearNotification(e, notification._id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-primary cursor-pointer justify-center"
              onClick={() => {
                setOpen(false)
                navigate("/notifications")
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
