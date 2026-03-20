"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MessageCircle, 
  Loader2,
  Send,
  Mail,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function SupportChatButton({ variant = "default", className = "" }) {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [existingChat, setExistingChat] = useState(null)
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  // Check for existing support chat
  useEffect(() => {
    const checkExistingChat = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/support/chats`, {
          credentials: "include",
        })
        const data = await response.json()
        if (data.success && data.chats?.length > 0) {
          // Get the most recent chat
          setExistingChat(data.chats[0])
        }
      } catch (error) {
        console.error("Check chat error:", error)
      }
    }

    if (user) {
      checkExistingChat()
    }
  }, [user])

  // Start or continue chat
  const handleStartChat = async () => {
    setLoading(true)
    try {
      if (existingChat) {
        // Navigate to existing chat
        navigate(`/user/support/chat/${existingChat._id}`)
      } else {
        // Create new chat by sending initial message
        const response = await fetch(`${API_BASE}/api/support/chats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            message: "Hello, I need support.", 
            subject: "Support Request" 
          }),
        })
        const data = await response.json()
        if (data.success) {
          navigate(`/user/support/chat/${data.chat._id}`)
        } else {
          toast.error(data.message || "Failed to start chat")
        }
      }
    } catch (error) {
      console.error("Start chat error:", error)
      toast.error("Failed to start chat")
    } finally {
      setLoading(false)
    }
  }

  // Send email to support
  const handleSendEmail = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setSendingEmail(true)
    try {
      const response = await fetch(`${API_BASE}/api/staff/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          subject: subject || "Support Request",
          message: message.trim(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Email sent successfully! A staff member will respond soon.")
        setSubject("")
        setMessage("")
        setDialogOpen(false)
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

  if (!user) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Live Chat Button */}
      <Button
        variant={variant}
        onClick={handleStartChat}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {existingChat ? "Continue Chat" : "Live Chat"}
        {existingChat?.unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1">
            {existingChat.unreadCount}
          </Badge>
        )}
      </Button>

      {/* Email Support Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Support
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Contact Support
            </DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
              disabled={!message.trim() || sendingEmail}
            >
              {sendingEmail ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Floating support button for placement in layouts
export function FloatingSupportButton() {
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  if (!user || user.role === "staff" || user.role === "admin") return null

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <motion.div
        animate={{ y: isHovered ? -5 : 0 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => navigate("/user/support/chat/new")}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-md text-sm font-medium"
          >
            Need help? Chat with us
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
