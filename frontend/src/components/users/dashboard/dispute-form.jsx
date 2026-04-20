"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../ui/dialog"
import { 
  AlertTriangle, 
  Upload, 
  X, 
  Loader2, 
  FileImage, 
  FileVideo, 
  File,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200"
}

const STATUS_ICONS = {
  pending: Clock,
  investigating: AlertCircle,
  resolved: CheckCircle2,
  rejected: X
}

// Raise Dispute Dialog Component
export function RaiseDisputeDialog({ bookingId, onSuccess, trigger }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    category: "",
    reason: "",
    evidence: []
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/user/api/dispute/categories`, {
          credentials: "include"
        })
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (formData.evidence.length + files.length > 5) {
      toast.error("Maximum 5 files allowed")
      return
    }

    setUploadingFiles(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)
        
        const response = await fetch(`${API_BASE}/user/api/upload`, {
          method: "POST",
          body: formDataUpload,
          credentials: "include"
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.url
        }
        throw new Error("Upload failed")
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...uploadedUrls]
      }))
      toast.success(`${files.length} file(s) uploaded`)
    } catch {
      // If upload API doesn't exist, store as base64 preview
      const base64Promises = files.map((file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      )
      const base64Files = await Promise.all(base64Promises)
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...base64Files]
      }))
    } finally {
      setUploadingFiles(false)
    }
  }

  const removeEvidence = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.category || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/user/api/dispute/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Dispute raised successfully")
        setOpen(false)
        setFormData({ category: "", reason: "", evidence: [] })
        onSuccess?.(data.booking)
      } else {
        toast.error(data.message || "Failed to raise dispute")
      }
    } catch (error) {
      console.error("Dispute submission error:", error)
      toast.error("Failed to submit dispute")
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (url) => {
    if (url.includes("image") || url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      return FileImage
    }
    if (url.includes("video") || url.match(/\.(mp4|mov|avi|webm)/i)) {
      return FileVideo
    }
    return File
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Raise Dispute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Raise a Dispute
          </DialogTitle>
          <DialogDescription>
            Report an issue with your service. Our team will investigate and respond within 24-48 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Dispute Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Describe the Issue *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide details about your complaint. Be specific about what went wrong..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.reason.length}/1000 characters
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Upload photos or videos to support your claim (max 5 files)
            </p>
            
            <div className="flex flex-wrap gap-2">
              {formData.evidence.map((url, index) => {
                const Icon = getFileIcon(url)
                const isImage = url.includes("image") || url.match(/\.(jpg|jpeg|png|gif|webp)/i) || url.startsWith("data:image")
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    {isImage ? (
                      <img 
                        src={url} 
                        alt={`Evidence ${index + 1}`} 
                        className="w-16 h-16 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md border flex items-center justify-center bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeEvidence(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                )
              })}
              
              {formData.evidence.length < 5 && (
                <label
                  className="w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {uploadingFiles ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFiles}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.category || !formData.reason}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Submit Dispute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Disputes List Component
export function DisputesList({ disputes, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No disputes found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Disputes you raise will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {disputes.map((dispute) => {
        const StatusIcon = STATUS_ICONS[dispute.status] || Clock
        return (
          <motion.div
            key={dispute._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${STATUS_COLORS[dispute.status]} border`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </Badge>
                      {dispute.category && (
                        <Badge variant="outline" className="text-xs">
                          {dispute.category.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{dispute.reason}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Filed on {new Date(dispute.raisedAt || dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {dispute.resolution && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Resolution:</p>
                    <p className="text-sm">{dispute.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// My Disputes Page Component
export function MyDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDisputes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/user/api/disputes`, {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setDisputes(data.disputes)
      }
    } catch (error) {
      console.error("Failed to fetch disputes:", error)
      toast.error("Failed to load disputes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            My Disputes
          </CardTitle>
          <CardDescription>
            Track the status of your raised disputes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DisputesList disputes={disputes} loading={loading} />
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RaiseDisputeDialog
