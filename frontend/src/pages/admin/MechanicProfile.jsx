import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Calendar, DollarSign, Clock, CheckCircle, XCircle, Trash2, Eye, Award, FileText, MessageSquare, Wrench } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function MechanicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mechanic, setMechanic] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchMechanicDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/mechanic/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch mechanic details");
      }
      const data = await response.json();
      setMechanic(data.mechanic);
      setProfile(data.profile);
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMechanicDetails();
  }, [id, fetchMechanicDetails]);

  const handleApprove = async () => {
    const ok = window.confirm("Approve this mechanic?");
    if (!ok) return;
    try {
      const response = await fetch(`${API_BASE}/admin/mechanic/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to approve mechanic");
      }
      await fetchMechanicDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    const ok = window.confirm("Reject this mechanic? This action cannot be undone.");
    if (!ok) return;
    try {
      const response = await fetch(`${API_BASE}/admin/mechanic/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to reject mechanic");
      }
      navigate('/admin/mechanics');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(`Are you sure you want to delete the mechanic ${mechanic?.name}? This action cannot be undone. All associated bookings and data will be deleted.`);
    if (!ok) return;
    try {
      const response = await fetch(`${API_BASE}/admin/mechanic/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete mechanic");
      }
      navigate('/admin/mechanics');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      accepted: { variant: "default", label: "Accepted" },
      "in-progress": { variant: "default", label: "In Progress" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = statusConfig[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Mechanic</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/mechanics')}>
            Back to Mechanics
          </Button>
        </div>
      </div>
    );
  }

  if (!mechanic) {
    return (
      <div className="container py-4">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Mechanic Not Found</h3>
          <p className="text-gray-600 mb-4">The mechanic you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/mechanics')}>
            Back to Mechanics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/mechanics">Manage Mechanics</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mechanic Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Profile & Location */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4 bg-blue-500">
                <AvatarFallback className="text-white text-xl font-semibold">
                  {mechanic.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-semibold mb-1">{mechanic.name}</h3>
              <p className="text-gray-600 mb-4">{mechanic.email}</p>

              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="default">
                  <Wrench className="w-3 h-3 mr-1" />
                  Mechanic
                </Badge>
                {mechanic.isApproved ? (
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Approval
                  </Badge>
                )}
              </div>

              {profile && (
                <>
                  <div className="flex justify-center mb-4">
                    {renderStars(profile.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({profile.rating?.toFixed(1) || 0})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="font-semibold">
                        {new Date(mechanic.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                      <p className="font-semibold">{bookings.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Experience</p>
                      <p className="font-semibold">{profile.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                      <p className="font-semibold text-green-600">
                        ${profile.hourlyRate}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">Availability</p>
                    <Badge variant={profile.availability ? "default" : "secondary"}>
                      {profile.availability ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </>
              )}

              <div className="space-y-2">
                {!mechanic.isApproved ? (
                  <>
                    <Button onClick={handleApprove} className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Mechanic
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="w-full">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Mechanic
                    </Button>
                  </>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Mechanic
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Mechanic</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the mechanic <strong>{mechanic.name}</strong>?
                          <br />
                          <span className="text-red-600">This action cannot be undone. All associated bookings and data will be deleted.</span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Delete Mechanic
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          {mechanic.location && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  Mechanic Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 rounded-b-lg overflow-hidden">
                  <MapContainer
                    center={[
                      mechanic.location.coordinates[1] || 0,
                      mechanic.location.coordinates[0] || 0
                    ]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[
                        mechanic.location.coordinates[1] || 0,
                        mechanic.location.coordinates[0] || 0
                      ]}
                    >
                      <Popup>Mechanic Location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-3 border-t">
                  <p className="text-sm text-gray-600 mb-0">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {mechanic.location?.address || 'Address not available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specializations */}
          {profile?.specialization && profile.specialization.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5" />
                  Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Job History & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job History */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Job History ({bookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h5 className="text-gray-900 mb-1">No jobs found</h5>
                  <p className="text-gray-600">This mechanic hasn't completed any jobs yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Problem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(booking.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {booking.user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{booking.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm" title={booking.problemCategory}>
                              {booking.problemCategory?.length > 20
                                ? `${booking.problemCategory.substring(0, 20)}...`
                                : booking.problemCategory}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            {booking.status === 'completed' ? (
                              booking.payment && booking.payment.status === 'completed' ? (
                                <div>
                                  <Badge variant="default" className="mb-1">Paid</Badge>
                                  <div className="text-sm font-semibold text-green-600">
                                    ${booking.payment.amount?.toFixed(2)}
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )
                            ) : (
                              <Badge variant="outline">N/A</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {profile?.certifications && profile.certifications.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certification</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.certifications.map((cert, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cert.name}</TableCell>
                          <TableCell>{cert.issuer}</TableCell>
                          <TableCell>{cert.year}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {profile?.documents && profile.documents.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Document {index + 1}</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {profile?.reviews && profile.reviews.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {profile.reviews.map((review, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {review.user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.user?.name}</span>
                        </div>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}