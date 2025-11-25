import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, Crown, UserCheck, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function User() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [displayedUsers, setDisplayedUsers] = useState([]);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/users`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/user/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const applyFilters = () => {
    const filtered = users.filter((user) => {
      const searchMatch =
        !search ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter === "all" || user.status === statusFilter;

      const premiumMatch =
        premiumFilter === "all" ||
        (premiumFilter === "premium" && user.premium) ||
        (premiumFilter === "regular" && !user.premium);

      let bookingMatch = true;
      const bookingCount = user.bookingCount || 0;
      if (bookingFilter === "0") bookingMatch = bookingCount === 0;
      else if (bookingFilter === "1-5") bookingMatch = bookingCount >= 1 && bookingCount <= 5;
      else if (bookingFilter === "6-10") bookingMatch = bookingCount >= 6 && bookingCount <= 10;
      else if (bookingFilter === "10+") bookingMatch = bookingCount > 10;

      let dateMatch = true;
      if (dateFilter !== "all") {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - userDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "last-7-days") dateMatch = diffDays <= 7;
        else if (dateFilter === "last-30-days") dateMatch = diffDays <= 30;
        else if (dateFilter === "last-90-days") dateMatch = diffDays <= 90;
      }

      return searchMatch && statusMatch && premiumMatch && bookingMatch && dateMatch;
    });
    setDisplayedUsers(filtered);
  };

  // Initialize displayed users when data loads
  useEffect(() => {
    if (users.length > 0) {
      setDisplayedUsers(users);
    }
  }, [users]);

  // Chart data preparation
  const registrationData = React.useMemo(() => {
    const months = [];
    const registrations = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleString('default', { month: 'short' }));
      registrations.push(0);
    }

    users.forEach(user => {
      const date = new Date(user.createdAt);
      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 5);

      if (date >= sixMonthsAgo) {
        const monthIndex = currentDate.getMonth() - date.getMonth();
        const normalizedIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
        if (normalizedIndex < 6) {
          registrations[5 - normalizedIndex]++;
        }
      }
    });

    return months.map((month, index) => ({
      month,
      registrations: registrations[index]
    }));
  }, [users]);

  const userTypeData = React.useMemo(() => {
    const premiumUsers = users.filter(user => user.premium).length;
    const regularUsers = users.length - premiumUsers;

    return [
      { name: 'Regular Users', value: regularUsers, color: '#38b000' },
      { name: 'Premium Users', value: premiumUsers, color: '#f8961e' }
    ];
  }, [users]);

  const COLORS = ["#4361ee", "#38b000", "#f8961e", "#4cc9f0", "#ef476f", "#ff6b6b"];

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Users</h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">Error: {error}</p>}

      {!loading && !error && (
        <>
          <Card className="mb-6">
            <CardHeader className="bg-blue-500/10 border-b border-blue-200 py-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <UserCheck className="w-5 h-5" />
                Filter Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Search
                  </label>
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Account Type
                  </label>
                  <Select
                    value={premiumFilter}
                    onValueChange={setPremiumFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bookings
                  </label>
                  <Select
                    value={bookingFilter}
                    onValueChange={setBookingFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bookings</SelectItem>
                      <SelectItem value="0">0 bookings</SelectItem>
                      <SelectItem value="1-5">1-5 bookings</SelectItem>
                      <SelectItem value="6-10">6-10 bookings</SelectItem>
                      <SelectItem value="10+">10+ bookings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Registration
                  </label>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                      <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="default" size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-500/10 border-b border-green-200 py-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                <Users className="w-5 h-5" />
                All Users ({displayedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.bookingCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.premium ? (
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/user/${user._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="bg-cyan-500/10 border-b border-cyan-200">
                <CardTitle className="flex items-center gap-2 mt-2 text-cyan-800">
                  <Calendar className="w-5 h-5" />
                  User Registration (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-purple-500/10 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 mt-2 text-purple-800">
                  <Crown className="w-5 h-5" />
                  User Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  {selectedUser?.name}? This action cannot be undone. All associated bookings and data will be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedUser) {
                      handleDelete(selectedUser._id);
                    }
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

    </div>
  );
}