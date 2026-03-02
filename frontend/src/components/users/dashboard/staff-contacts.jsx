"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  AlertTriangle,
  Headphones,
  Loader2,
  Users,
  ExternalLink
} from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export function StaffContacts() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [chattingWith, setChattingWith] = useState(null)
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStaffContacts()
  }, [])

  const fetchStaffContacts = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/api/staff/contacts`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setStaff(data.staff)
      }
    } catch (error) {
      console.error("Failed to fetch staff contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phone, name) => {
    if (phone) {
      window.location.href = `tel:${phone}`
      toast.success(`Calling ${name}...`)
    } else {
      toast.error("Phone number not available")
    }
  }

  const handleChat = async (staffId, name) => {
    setChattingWith(staffId)
    try {
      const response = await fetch(`${API_BASE}/user/api/staff/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ staffId }),
      })
      const data = await response.json()
      if (data.success) {
        navigate(`/user/chat/${data.chat._id}`)
        toast.success(`Starting chat with ${name}`)
      } else {
        toast.error(data.message || "Failed to start chat")
      }
    } catch (error) {
      console.error("Failed to start chat:", error)
      toast.error("Failed to start chat")
    } finally {
      setChattingWith(null)
    }
  }

  const handleEmail = (email, name) => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Support%20Request%20from%20${user?.name || 'User'}`
      toast.success(`Opening email to ${name}`)
    } else {
      toast.error("Email not available")
    }
  }

  const getInitials = (name) => {
    if (!name) return "ST"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-blue-500" />
            Support Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-blue-500" />
                Support Staff
              </CardTitle>
              <CardDescription>
                Contact our staff for help, disputes, or emergencies
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {staff.length} Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No support staff available at the moment</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profileImage} alt={member.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.phone && (
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(member.phone, member.name)}
                      disabled={!member.phone}
                      className="gap-1"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">Call</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChat(member._id, member.name)}
                      disabled={chattingWith === member._id}
                      className="gap-1"
                    >
                      {chattingWith === member._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Chat</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(member.email, member.name)}
                      className="gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {/* Emergency Contact Notice */}
              <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Emergency Support</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      For urgent issues, disputes, or if you feel unsafe, contact any staff member immediately. 
                      They are available to help with service complaints, fake parts, or any emergency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StaffContacts
