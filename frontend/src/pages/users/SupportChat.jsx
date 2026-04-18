"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Phone,
  Mail,
  CheckCheck,
  Check,
  MessageCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { getSocket, authenticateSocket } from "../../../libs/socket"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function SupportChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const socketRef = useRef(null)

  const { user } = useSelector((state) => state.auth)

  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeoutId] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  
  // Email dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  // Initialize socket
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (socket) {
      const handleConnect = () => {
        console.log("Socket connected:", socket.id)
        setSocketConnected(true)
        // Authenticate socket with user ID
        if (user?._id) {
          authenticateSocket(user._id)
        }
      }

      socket.on("connect", handleConnect)

      socket.on("disconnect", () => {
        console.log("Socket disconnected")
        setSocketConnected(false)
      })

      // If already connected, authenticate immediately
      if (socket.connected) {
        setSocketConnected(true)
        if (user?._id) {
          authenticateSocket(user._id)
        }
      }
    }

    return () => {
      if (socket) {
        socket.off("connect")
        socket.off("disconnect")
      }
    }
  }, [user])

  // Fetch chat and messages
  const fetchChat = useCallback(async () => {
    if (!chatId) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/user/api/staff/chat/${chatId}/messages`, {
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Chat data:", data)
      
      if (data.success) {
        setChat(data.chat)
        
        // Filter messages to last 24 hours
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const recentMessages = (data.messages || []).filter(msg => {
          const msgDate = new Date(msg.timestamp || msg.createdAt)
          return msgDate >= twentyFourHoursAgo
        })
        
        setMessages(recentMessages)
        
        // Find the other participant (staff)
        const other = data.chat?.participants?.find(p => 
          p._id !== user?._id && (p.role === "staff" || p.role === "admin")
        )
        setOtherUser(other || { name: "Support Staff", role: "staff" })
      } else {
        console.error("Failed to load chat:", data.message)
        toast.error(data.message || "Failed to load chat")
      }
    } catch (error) {
      console.error("Fetch chat error:", error)
      toast.error("Failed to load chat. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [chatId, user])

  useEffect(() => {
    if (chatId && user) {
      fetchChat()
    }
  }, [chatId, user, fetchChat])

  // Socket event handlers
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !chatId) return

    const joinChatRoom = () => {
      socket.emit("join-staff-chat", chatId)
      console.log("Joined chat room:", chatId)
    }

    joinChatRoom()
    socket.on("connect", joinChatRoom)

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log("New message received:", data)
      if (data.chatId === chatId) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === data.message._id)
          if (exists) return prev
          return [...prev, data.message]
        })
        
        // Mark as read if from other user
        if (data.message.sender?._id !== user?._id && data.message.sender !== user?._id) {
          socket.emit("mark-staff-message-read", { 
            chatId, 
            messageId: data.message._id 
          })
        }
      }
    }

    // Listen for typing indicator
    const handleTyping = (data) => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setIsTyping(data.isTyping)
      }
    }

    // Listen for message read status
    const handleMessageRead = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId ? { ...msg, read: true } : msg
          )
        )
      }
    }

    socket.on("new-staff-message", handleNewMessage)
    socket.on("staff-chat-user-typing", handleTyping)
    socket.on("staff-message-read", handleMessageRead)

    return () => {
      socket.off("connect", joinChatRoom)
      socket.off("new-staff-message", handleNewMessage)
      socket.off("staff-chat-user-typing", handleTyping)
      socket.off("staff-message-read", handleMessageRead)
      socket.emit("leave-staff-chat", chatId)
    }
  }, [chatId, user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    
    const socket = socketRef.current
    if (socket && chatId) {
      socket.emit("staff-chat-typing", { chatId, isTyping: true })
      
      if (typingTimeout) clearTimeout(typingTimeout)
      
      const timeout = setTimeout(() => {
        socket.emit("staff-chat-typing", { chatId, isTyping: false })
      }, 1000)
      setTypingTimeoutId(timeout)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()
    setNewMessage("")
    setSending(true)

    const socket = socketRef.current
    if (socket) {
      socket.emit("staff-chat-typing", { chatId, isTyping: false })
    }

    try {
      // Try socket first for real-time
      if (socket && socket.connected) {
        socket.emit("send-staff-message", {
          chatId,
          content: messageContent,
        })
      } else {
        // Fallback to API
        const response = await fetch(`${API_BASE}/user/api/staff/chat/${chatId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: messageContent }),
        })
        const data = await response.json()
        if (data.success) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === data.message?._id)
            if (exists) return prev
            return [...prev, data.message]
          })
        } else {
          toast.error(data.message || "Failed to send message")
        }
      }
    } catch (error) {
      console.error("Send message error:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Send email to staff
  const handleSendEmail = async () => {
    if (!emailMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    setSendingEmail(true)
    try {
      const response = await fetch(`${API_BASE}/user/api/staff/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          subject: emailSubject || "Support Request",
          message: emailMessage.trim(),
          staffId: otherUser?._id,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Email sent successfully!")
        setEmailSubject("")
        setEmailMessage("")
        setEmailDialogOpen(false)
      } else {
        toast.error(data.message || "Failed to send email")
      }
    } catch (error) {
      console.error("Send email error:", error)
      toast.error("Failed to send email")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  }

  const getInitials = (name) => {
    if (!name) return "S"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp || message.createdAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <Card className="mb-4 shrink-0">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/user/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser?.profileImage} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(otherUser?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{otherUser?.name || "Support Staff"}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">Support</Badge>
                  {socketConnected && (
                    <span className="text-green-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  {isTyping && (
                    <span className="text-primary text-xs animate-pulse">typing...</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchChat}
                title="Refresh chat"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              
              {/* Email Dialog */}
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Send email">
                    <Mail className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Email Support Staff
                    </DialogTitle>
                    <DialogDescription>
                      Send an email to get a detailed response from our support team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-message">Message</Label>
                      <Textarea
                        id="email-message"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleSendEmail}
                      disabled={!emailMessage.trim() || sendingEmail}
                    >
                      {sendingEmail ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Email
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-lg mb-1">Start the conversation</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Send a message to start chatting with our support team. 
                  Messages from the last 24 hours will appear here.
                </p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center justify-center mb-4">
                    <Badge variant="outline" className="text-xs font-normal">
                      {date}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {msgs.map((msg, index) => {
                        const isOwnMessage = msg.sender?._id === user?._id || 
                          msg.sender === user?._id
                        return (
                          <motion.div
                            key={msg._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              } ${msg.pending ? "opacity-70" : ""}`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}>
                                <span className={`text-[10px] ${
                                  isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {formatTime(msg.timestamp || msg.createdAt)}
                                </span>
                                {isOwnMessage && (
                                  msg.read ? (
                                    <CheckCheck className="h-3 w-3 text-blue-300" />
                                  ) : (
                                    <Check className="h-3 w-3 text-primary-foreground/50" />
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {!socketConnected && (
            <p className="text-xs text-yellow-600 mt-2">
              Real-time connection unavailable. Messages will be sent via HTTP.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
