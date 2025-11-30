import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Calendar, MapPin, User, Wrench, Phone, Mail, Clock, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon, CreditCard, FileText, Trash2, UserPlus } from "lucide-react";
import 'leaflet/dist/leaflet.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [availableMechanics, setAvailableMechanics] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/booking/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }
      const data = await response.json();
      setBooking(data.booking);
      setAvailableMechanics(data.availableMechanics || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMechanic = async () => {
    if (!selectedMechanic) return;

    try {
      const response = await fetch(`${API_BASE}/admin/booking/${id}/assign-mechanic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mechanicId: selectedMechanic }),
      });

      if (response.ok) {
        setAssignModalOpen(false);
        setSelectedMechanic("");
        fetchBookingDetails(); // Refresh data
      } else {
        throw new Error('Failed to assign mechanic');
      }
    } catch (err) {
      console.error('Error assigning mechanic:', err);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteBooking = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/booking/${id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/admin/bookings');
      } else {
        throw new Error('Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      // You might want to show a toast notification here
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "in-progress":
        return <Badge variant="outline">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimelineItems = () => {
    if (!booking) return [];

    const items = [];

    // Booking created
    items.push({
      title: "Booking Created",
      description: `Booking was created`,
      timestamp: booking.createdAt,
      icon: Calendar,
      color: "bg-blue-500"
    });

    // Mechanic assigned
    if (booking.mechanic) {
      items.push({
        title: "Mechanic Assigned",
        description: `Assigned to ${booking.mechanic.name}`,
        timestamp: booking.updatedAt,
        icon: UserPlus,
        color: "bg-green-500"
      });
    }

    // Booking accepted
    if (['accepted', 'in-progress', 'completed'].includes(booking.status)) {
      items.push({
        title: "Booking Accepted",
        description: "Mechanic accepted the booking",
        timestamp: booking.updatedAt,
        icon: CheckCircle,
        color: "bg-green-500"
      });
    }

    // Service started
    if (['in-progress', 'completed'].includes(booking.status)) {
      items.push({
        title: "Service Started",
        description: "Mechanic started working on the bike",
        timestamp: booking.updatedAt,
        icon: Wrench,
        color: "bg-orange-500"
      });
    }

    // Service completed
    if (booking.status === 'completed') {
      items.push({
        title: "Service Completed",
        description: "Service has been completed successfully",
        timestamp: booking.updatedAt,
        icon: CheckCircle,
        color: "bg-green-500"
      });
    }

    // Payment
    if (booking.status === 'completed' && booking.payment) {
      items.push({
        title: "Payment",
        description: booking.payment.status === 'completed' ? 'Payment completed' : 'Payment pending',
        timestamp: booking.updatedAt,
        icon: CreditCard,
        color: booking.payment.status === 'completed' ? "bg-green-500" : "bg-yellow-500"
      });
    }

    // Cancelled
    if (booking.status === 'cancelled') {
      items.push({
        title: "Booking Cancelled",
        description: "Booking was cancelled",
        timestamp: booking.updatedAt,
        icon: XCircle,
        color: "bg-red-500"
      });
    }

    return items;
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
        <p className="text-red-600 bg-red-50 p-4 rounded-lg">Error: {error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-4">
        <p className="text-gray-600">Booking not found</p>
      </div>
    );
  }

  const timelineItems = getTimelineItems();
  const canAssignMechanic = booking.status === 'pending' && !booking.mechanic;

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/bookings">Manage Bookings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Booking Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/bookings")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Booking Details</h1>
        </div>
        <div className="flex gap-2">
          {canAssignMechanic && (
            <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Mechanic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Mechanic</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Mechanic</label>
                    <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a mechanic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMechanics.length === 0 ? (
                          <SelectItem value="" disabled>No matching mechanics available</SelectItem>
                        ) : (
                          availableMechanics.map(mechanic => (
                            <SelectItem key={mechanic._id} value={mechanic._id}>
                              {mechanic.name} - {mechanic.specialization?.join(', ') || 'General'} - {mechanic.experience} years
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Only available mechanics with relevant skills are shown.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAssignMechanic} disabled={!selectedMechanic}>
                      Assign Mechanic
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Booking
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this booking? This action cannot be undone.
                  All associated data will be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBooking} className="bg-red-600 hover:bg-red-700">
                  Delete Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Booking Information */}
          <Card className="mb-6">
            <CardHeader className="bg-blue-500/10 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800 mt-2">
                <Calendar className="w-5 h-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">{booking._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">{booking.problemCategory || "Uncategorized"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency:</span>
                      {booking.emergencyRequest ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(booking.createdAt).toLocaleString()}</span>
                    </div>
                    {booking.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated:</span>
                        <span className="font-medium">{new Date(booking.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Problem Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {booking.problemDescription || booking.description || "No description provided"}
                  </p>
                  {booking.preferredTime && (
                    <div className="mt-4">
                      <span className="text-gray-600">Preferred Time:</span>
                      <p className="font-medium">{booking.preferredTime}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {booking.images && booking.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {booking.images.map((image, index) => (
                      <a
                        key={index}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={image}
                          alt={`Booking image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Notes */}
              {booking.status === 'completed' && booking.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Service Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {booking.status === 'completed' && booking.payment && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${booking.payment.amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Status</p>
                        <Badge variant={booking.payment.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.payment.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    {booking.payment.status === 'completed' && booking.payment.transactionId && (
                      <div className="mt-4">
                        <p className="text-gray-600 mb-1">Transaction ID</p>
                        <p className="font-mono text-sm">{booking.payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Map */}
          {booking.location && booking.location.coordinates && (
            <Card className="mb-6">
              <CardHeader className="bg-green-500/10 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-green-800 mt-2">
                  <MapPin className="w-5 h-5" />
                  Booking Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: '300px' }}>
                  <MapContainer
                    center={[booking.location.coordinates.lat || booking.location.coordinates[1], booking.location.coordinates.lng || booking.location.coordinates[0]]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[booking.location.coordinates.lat || booking.location.coordinates[1], booking.location.coordinates.lng || booking.location.coordinates[0]]}
                    >
                      <Popup>Booking Location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {booking.location.address || "Address not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Map for In-Progress Bookings */}
          {booking.status === 'in-progress' && booking.mechanic && booking.location && booking.location.coordinates && (
            <Card>
              <CardHeader className="bg-orange-500/10 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-orange-800 mt-2">
                  <MapPin className="w-5 h-5" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: '300px' }}>
                  <MapContainer
                    center={[booking.location.coordinates.lat || booking.location.coordinates[1], booking.location.coordinates.lng || booking.location.coordinates[0]]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[booking.location.coordinates.lat || booking.location.coordinates[1], booking.location.coordinates.lng || booking.location.coordinates[0]]}
                    >
                      <Popup>Current Location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {/* Customer Information */}
          <Card className="mb-6">
            <CardHeader className="bg-purple-500/10 border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800 mt-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {booking.user?.name.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-semibold">{booking.user?.name}</h4>
                <p className="text-gray-600 text-sm">{booking.user?.email}</p>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{booking.user?.email}</span>
                </div>
                {booking.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.user?.phone}</span>
                  </div>
                )}
                {booking.user?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{booking.user?.address}</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/admin/user/${booking.user?._id}`)}
              >
                <User className="w-4 h-4 mr-2" />
                View User Profile
              </Button>
            </CardContent>
          </Card>

          {/* Assigned Mechanic */}
          {booking.mechanic && (
            <Card className="mb-6">
              <CardHeader className="bg-orange-500/10 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-orange-800 mt-2">
                  <Wrench className="w-5 h-5" />
                  Assigned Mechanic
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {booking.mechanic?.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-semibold">{booking.mechanic?.name}</h4>
                  <p className="text-gray-600 text-sm">{booking.mechanic?.email}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.mechanic?.email}</span>
                  </div>
                  {booking.mechanic?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{booking.mechanic?.phone}</span>
                    </div>
                  )}
                  {booking.mechanic?.specialization && (
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm">{booking.mechanic.specialization.join(', ')}</span>
                    </div>
                  )}
                  {booking.mechanic?.experience && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{booking.mechanic.experience} years experience</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Timeline */}
          <Card>
            <CardHeader className="bg-gray-500/10 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-800 mt-2">
                <Clock className="w-5 h-5" />
                Booking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                {timelineItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 relative">
                      {/* Timeline line */}
                      {index < timelineItems.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                      )}

                      {/* Timeline marker */}
                      <div className={`w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm flex-shrink-0 mt-2`}></div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h6 className="font-medium text-sm">{item.title}</h6>
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}