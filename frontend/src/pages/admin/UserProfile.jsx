import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, DollarSign, Clock, CheckCircle, XCircle, Trash2, Eye, Crown, FileText, MessageSquare, User } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/user/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUser(data.user);
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [id, fetchUserDetails]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/user/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      navigate("/admin/users");
    } catch (err) {
      setError(err.message);
    }
  };

  // Chart data preparation
  const categoryData = React.useMemo(() => {
    if (!bookings.length) return [];

    const categories = {};
    bookings.forEach(booking => {
      const category = booking.problemCategory || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#4895ef', '#560bad', '#f3722c', '#f8961e', '#90be6d'][Object.keys(categories).indexOf(name) % 10]
    }));
  }, [bookings]);

  const activityData = React.useMemo(() => {
    const months = [];
    const bookingCounts = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleString('default', { month: 'short' }));
      bookingCounts.push(0);
    }

    // Calculate bookings for each month
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 5);

      if (bookingDate >= sixMonthsAgo) {
        const monthIndex = currentDate.getMonth() - bookingDate.getMonth();
        const normalizedIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
        if (normalizedIndex < 6) {
          bookingCounts[5 - normalizedIndex]++;
        }
      }
    });

    return months.map((month, index) => ({
      month,
      bookings: bookingCounts[index]
    }));
  }, [bookings]);

  const userTypeData = React.useMemo(() => {
    const premium = user?.premium ? 1 : 0;
    const regular = user?.premium ? 0 : 1;

    return [
      { name: 'Premium', value: premium, color: '#f59e0b' },
      { name: 'Regular', value: regular, color: '#6b7280' }
    ].filter(item => item.value > 0);
  }, [user]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="flex items-center justify-center min-h-[200px]">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
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
            <BreadcrumbLink href="/admin/users">Manage Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-bold mb-1">{user.name}</h3>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              <div className="flex justify-center gap-2 mb-4">
                {user.premium ? (
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary">Regular</Badge>
                )}
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bookings:</span>
                  <span className="font-medium">{user.bookingCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{user.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Location Map */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 rounded-b-lg overflow-hidden">
                {user.location?.coordinates ? (
                  <MapContainer
                    center={[user.location.coordinates[1], user.location.coordinates[0]]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[user.location.coordinates[1], user.location.coordinates[0]]}>
                      <Popup>User Location</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No location data</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Booking History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Booking History
                </div>
                <Badge variant="secondary">{bookings.length} Bookings</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-500">This user hasn't made any bookings.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Problem</TableHead>
                        <TableHead>Mechanic</TableHead>
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
                              <div className="text-sm text-muted-foreground">
                                {new Date(booking.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="truncate max-w-32 block" title={booking.problemCategory}>
                              {booking.problemCategory}
                            </span>
                          </TableCell>
                          <TableCell>
                            {booking.mechanic ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {booking.mechanic.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{booking.mechanic.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'accepted' ? 'secondary' :
                                booking.status === 'pending' ? 'outline' :
                                'destructive'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'completed' && booking.payment ? (
                              <div>
                                <div className="font-medium text-green-600">
                                  ${booking.payment.amount?.toFixed(2)}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {booking.payment.status}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                            >
                              <Eye className="w-4 h-4" />
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Booking Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Activity (6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone. All associated bookings and data will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}