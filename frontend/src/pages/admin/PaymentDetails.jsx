import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Calendar, MapPin, User, Wrench, Phone, Mail, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, FileText, Eye, Edit } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [mechanic, setMechanic] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/payment/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch payment details");
      }
      const data = await response.json();
      setPayment(data.payment);
      setBooking(data.booking);
      setCustomer(data.customer);
      setMechanic(data.mechanic);
      setNewStatus(data.payment.status);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/api/payment/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      // Refresh payment details
      await fetchPaymentDetails();
      setStatusModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment Details</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/admin/payments")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/payments">Payments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Payment Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/payments")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="p-2 rounded-lg bg-blue-500/10">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Payment Details</h1>
            <p className="text-gray-600">Payment ID: {payment?._id?.toString().substring(0, 8)}...</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment Status</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updatePaymentStatus}>
                  Update Status
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-blue-500/10 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-2xl font-bold text-green-600">${payment?.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(payment?.status)}>
                      {payment?.status?.charAt(0).toUpperCase() + payment?.status?.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="font-mono text-sm">{payment?.transactionId || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="capitalize">{payment?.method || "Card"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gateway</label>
                  <p className="capitalize">{payment?.gateway || "Stripe"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p>{new Date(payment?.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card>
            <CardHeader className="bg-green-500/10 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="w-5 h-5" />
                Payment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Payment timeline data is not available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="bg-purple-500/10 border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                  {customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{customer?.name}</p>
                  <p className="text-sm text-gray-600">{customer?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{customer?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{customer?.address}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/admin/user/${customer?._id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader className="bg-orange-500/10 border-b border-orange-200">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <FileText className="w-5 h-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Booking ID</label>
                <p className="font-mono text-sm">{booking?._id?.toString().substring(0, 8)}...</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Service Type</label>
                <p className="capitalize">{booking?.serviceType || "General Service"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant="outline" className="mt-1">
                  {booking?.status?.charAt(0).toUpperCase() + booking?.status?.slice(1)}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                <p>{booking?.scheduledDate ? new Date(booking.scheduledDate).toLocaleString() : "Not scheduled"}</p>
              </div>
              {booking?.emergencyRequest && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">Emergency Request</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/admin/booking/${booking?._id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Booking Details
              </Button>
            </CardContent>
          </Card>

          {/* Mechanic Information */}
          {mechanic && (
            <Card>
              <CardHeader className="bg-green-500/10 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Wrench className="w-5 h-5" />
                  Assigned Mechanic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-medium">
                    {mechanic?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{mechanic?.name}</p>
                    <p className="text-sm text-gray-600">{mechanic?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{mechanic?.phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/admin/mechanic/${mechanic?._id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Mechanic Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}