"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  MessageCircle,
  Users,
  CheckCheck,
  Check,
  Inbox,
  Clock,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { getSocket, authenticateSocket } from "../../../libs/socket"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

// Staff Chat List Component
export function StaffChatList() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/staff/chats`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error("Fetch chats error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
    
    const socket = getSocket()
    
    // Authenticate socket
    if (socket && user?._id) {
      if (socket.connected) {
        authenticateSocket(user._id)
      }
      socket.on("connect", () => {
        authenticateSocket(user._id)
      })
    }
    
    // Listen for new messages
    if (socket) {
      socket.on("new-staff-message", () => {
        fetchChats() // Refresh list when new message arrives
      })
      
      return () => {
        socket.off("new-staff-message")
        socket.off("connect")
      }
    }
  }, [fetchChats, user])

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = (now - date) / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffHours < 48) {
      return "Yesterday"
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const filteredChats = chats.filter(chat => {
    if (activeTab === "unread") return chat.unreadCount > 0
    return true
  })

  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Support Chats</h2>
        {totalUnread > 0 && (
          <Badge variant="destructive">{totalUnread} unread</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Inbox className="h-4 w-4" />
            All Chats
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Unread
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {totalUnread}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredChats.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {activeTab === "unread" ? "No unread messages" : "No chats yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => {
                const chatUser = chat.participants?.find(p => p.role !== "staff")
                const lastMessage = chat.messages?.[chat.messages.length - 1]
                
                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="cursor-pointer"
                    onClick={() => navigate(`/staff/chat/${chat._id}`)}
                  >
                    <Card className={`p-4 transition-colors hover:bg-accent/50 ${
                      chat.unreadCount > 0 ? 'border-primary bg-primary/5' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={chatUser?.profileImage} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(chatUser?.name)}
                            </AvatarFallback>
                          </Avatar>
                          {chat.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{chatUser?.name || "User"}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastActivity)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage?.content || "No messages yet"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {chatUser?.email}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Staff Chat Page Component
export default function StaffChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { user } = useSelector((state) => state.auth)

  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeoutId] = useState(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailMessage, setEmailMessage] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  // Initialize socket
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    
    if (socket) {
      const handleConnect = () => {
        setSocketConnected(true)
        if (user?._id) {
          authenticateSocket(user._id)
        }
      }
      
      socket.on("connect", handleConnect)
      socket.on("disconnect", () => setSocketConnected(false))
      
      if (socket.connected) {
        setSocketConnected(true)
        if (user?._id) {
          authenticateSocket(user._id)
        }
      }
      
      return () => {
        socket.off("connect", handleConnect)
        socket.off("disconnect")
      }
    }
  }, [user])

  // Fetch chat and messages
  const fetchChat = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/staff/chat/${chatId}`, {
        credentials: "include",
      })
      const data = await response.json()
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
        
        setOtherUser(data.user)
      } else {
        toast.error(data.message || "Failed to load chat")
        navigate("/staff/chats")
      }
    } catch (error) {
      console.error("Fetch chat error:", error)
      toast.error("Failed to load chat")
    } finally {
      setLoading(false)
    }
  }, [chatId, navigate])

  useEffect(() => {
    if (chatId) {
      fetchChat()
    }
  }, [chatId, fetchChat])

  // Socket event handlers
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !chatId) return

    const joinChatRoom = () => {
      socket.emit("join-staff-chat", chatId)
    }

    joinChatRoom()
    socket.on("connect", joinChatRoom)

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === data.message._id)
          if (exists) return prev
          return [...prev, data.message]
        })
        // Mark as read if from other user
        if (data.message.sender._id !== user?._id) {
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
      if (socket && socket.connected) {
        socket.emit("send-staff-message", {
          chatId,
          content: messageContent,
        })
      } else {
        const response = await fetch(`${API_BASE}/staff/chat/${chatId}/send`, {
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

  // Send email response
  const handleSendEmail = async () => {
    if (!emailMessage.trim() || !otherUser) return
    
    setSendingEmail(true)
    try {
      const response = await fetch(`${API_BASE}/staff/email/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          userId: otherUser._id, 
          message: emailMessage,
          subject: "Support Response",
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Email sent successfully")
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
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/staff/chats")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.profileImage} />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {getInitials(otherUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{otherUser?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{otherUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {otherUser?.phone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = `tel:${otherUser.phone}`}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                )}
                
                {/* Email Dialog */}
                <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Email to {otherUser?.name}</DialogTitle>
                      <DialogDescription>
                        Send an email response to the user at {otherUser?.email}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Type your email message..."
                        rows={6}
                      />
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
                          <Mail className="h-4 w-4 mr-2" />
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
              {Object.entries(groupedMessages).map(([date, msgs]) => (
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
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}>
                                <span className={`text-[10px] ${
                                  isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {formatTime(msg.timestamp)}
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
              ))}
              
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
          <div className="p-4 border-t">
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
          </div>
        </Card>
      </div>
    </div>
  )
}
