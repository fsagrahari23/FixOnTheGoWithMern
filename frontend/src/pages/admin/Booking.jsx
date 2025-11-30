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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Wrench } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [displayedBookings, setDisplayedBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/bookings`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data.bookings || []);
      setStats(data.bookingStats || { total: 0, active: 0, completed: 0, cancelled: 0 });
      setCategoryData(data.bookingByCategory || []);
      setTrendData(data.bookingTrends || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = bookings.filter((booking) => {
      const searchMatch =
        !search ||
        booking.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.mechanic?.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.problemDescription?.toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter === "all" || booking.status === statusFilter;

      const categoryMatch = categoryFilter === "all" || booking.problemCategory === categoryFilter;

      let dateMatch = true;
      if (dateFrom || dateTo) {
        const bookingDate = new Date(booking.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          dateMatch = dateMatch && bookingDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          dateMatch = dateMatch && bookingDate <= toDate;
        }
      }

      return searchMatch && statusMatch && categoryMatch && dateMatch;
    });

    setDisplayedBookings(filtered);
  };

  // Initialize displayed bookings when data loads
  useEffect(() => {
    if (bookings.length > 0) {
      setDisplayedBookings(bookings);
    }
  }, [bookings]);

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

  const getCategoryColor = (category) => {
    const colors = {
      'Engine Issues': '#4361ee',
      'Brake Problems': '#38b000',
      'Electrical Issues': '#f8961e',
      'Tire Puncture': '#4cc9f0',
      'Battery Issues': '#ef476f',
      'Other': '#ff6b6b',
      'Uncategorized': '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  const categoryChartData = React.useMemo(() => {
    return categoryData.map(item => ({
      name: item._id || 'Uncategorized',
      value: item.count,
      color: getCategoryColor(item._id)
    }));
  }, [categoryData]);

  const trendChartData = React.useMemo(() => {
    return trendData.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: item.count
    }));
  }, [trendData]);

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage Bookings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Bookings</h1>
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
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg mt-2">
                <Wrench className="w-5 h-5" />
                Filter Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Category
                  </label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Engine Issues">Engine Issues</SelectItem>
                      <SelectItem value="Brake Problems">Brake Problems</SelectItem>
                      <SelectItem value="Electrical Issues">Electrical Issues</SelectItem>
                      <SelectItem value="Tire Puncture">Tire Puncture</SelectItem>
                      <SelectItem value="Battery Issues">Battery Issues</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Input
                  placeholder="Search bookings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="default" size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-linear-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 mb-1">Total Bookings</p>
                    <h3 className="text-2xl font-bold">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-yellow-100 mb-1">Active Bookings</p>
                    <h3 className="text-2xl font-bold">{stats.active}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 mb-1">Completed</p>
                    <h3 className="text-2xl font-bold">{stats.completed}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-red-100 mb-1">Cancelled</p>
                    <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="bg-green-500/10 border-b border-green-200 py-3">
              <CardTitle className="flex items-center justify-between text-green-800 text-lg mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  All Bookings ({displayedBookings.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mechanic</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Emergency</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {booking.user?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{booking.user?.name}</div>
                            <div className="text-sm text-gray-500">{booking.problemDescription}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.mechanic?.name || "Not Assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.problemCategory || "Uncategorized"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {booking.emergencyRequest ? (
                          <Badge variant="destructive">Emergency</Badge>
                        ) : (
                          <Badge variant="secondary">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/booking/${booking._id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-purple-500/10 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-purple-800 mt-2">
                  <TrendingUp className="w-5 h-5" />
                  Bookings by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-200">
                <CardTitle className="flex items-center gap-2 text-indigo-800 mt-2">
                  <TrendingUp className="w-5 h-5" />
                  Bookings Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#4361ee"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}