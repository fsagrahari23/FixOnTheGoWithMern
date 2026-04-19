import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, CreditCard, User, Wrench, Calendar, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const fetchPaymentDetail = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/api/booking/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load payment data");
      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const handleRefund = async () => {
    if (!window.confirm("Are you sure you want to issue a full refund to this customer? This action cannot be undone.")) return;
    
    setRefunding(true);
    try {
      const res = await fetch(`${API_BASE}/admin/api/payment/${id}/refund`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process refund");
      }
      
      toast.success("Refund processed successfully");
      fetchPaymentDetail(); // Reload data to show updated status
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading payment details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!booking) return <div className="p-8 text-center">Payment not found</div>;

  const { payment, user, mechanic } = booking;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumb className="mb-4">
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
            <BreadcrumbPage>Transaction #{payment?.transactionId || id.slice(-8)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/booking/${booking._id}`)}>
            <Calendar className="w-4 h-4 mr-2" />
            View Booking
          </Button>
          {(payment?.status === "completed") && (
            <Button variant="destructive" onClick={handleRefund} disabled={refunding}>
              {refunding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {refunding ? "Processing..." : "Issue Refund"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Payment Info */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Transaction Summary
                </CardTitle>
                <CardDescription className="mt-1">
                  ID: <span className="font-mono">{payment?.transactionId || "N/A"}</span>
                </CardDescription>
              </div>
              <Badge variant={payment?.status === 'completed' ? 'success' : 'secondary'} className="text-sm px-3 py-1">
                {(payment?.status || "pending").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between border-b pb-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount Paid</p>
                <h2 className="text-4xl font-bold">${(payment?.amount || 0).toFixed(2)}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium">{new Date(booking.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Status</p>
                  <p className="font-medium capitalize">{booking.status}</p>
                </div>
              </div>
              {booking.paymentMethod && (
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg h-fit">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{booking.paymentMethod}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Associated Entities */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-medium">{user?.name || "Unknown User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
              <p className="text-sm text-muted-foreground">{user?.phone || "No phone"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                Mechanic
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {mechanic ? (
                <>
                  <p className="font-medium">{mechanic.name}</p>
                  <p className="text-sm text-muted-foreground">{mechanic.email || "No email"}</p>
                  <p className="text-sm text-muted-foreground">{mechanic.phone || "No phone"}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">No mechanic assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
