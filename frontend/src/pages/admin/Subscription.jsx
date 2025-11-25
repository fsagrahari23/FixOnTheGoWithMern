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
import { Crown, DollarSign, Calendar, TrendingUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [displayedSubscriptions, setDisplayedSubscriptions] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
    fetchRevenueData();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/api/subscriptions`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/api/subscriptions/revenue?months=6`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }
      const data = await response.json();
      setRevenueData(data.monthlyRevenue || []);
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/subscription/${id}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      await fetchSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const applyFilters = () => {
    const filtered = subscriptions.filter((subscription) => {
      const searchMatch =
        !search ||
        subscription.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        subscription.user?.email.toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter === "all" ||
        (statusFilter === "active" && subscription.status === "active" && new Date(subscription.expiresAt) > new Date()) ||
        (statusFilter === "cancelled" && subscription.status === "cancelled") ||
        (statusFilter === "expired" && (subscription.status !== "active" || new Date(subscription.expiresAt) <= new Date()));

      let amountMatch = true;
      if (amountFilter !== "all") {
        const amount = subscription.amount || 0;
        if (amountFilter === "0-50") amountMatch = amount >= 0 && amount <= 50;
        else if (amountFilter === "50-100") amountMatch = amount > 50 && amount <= 100;
        else if (amountFilter === "100-200") amountMatch = amount > 100 && amount <= 200;
        else if (amountFilter === "200+") amountMatch = amount > 200;
      }

      let dateMatch = true;
      if (dateFrom || dateTo) {
        const subscriptionDate = new Date(subscription.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          dateMatch = dateMatch && subscriptionDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          dateMatch = dateMatch && subscriptionDate <= toDate;
        }
      }

      return searchMatch && statusMatch && amountMatch && dateMatch;
    });

    setDisplayedSubscriptions(filtered);
  };

  // Initialize displayed subscriptions when data loads
  useEffect(() => {
    if (subscriptions.length > 0) {
      setDisplayedSubscriptions(subscriptions);
    }
  }, [subscriptions]);
  const planData = React.useMemo(() => {
    const activeSubscriptions = displayedSubscriptions.filter(sub =>
      sub.status === "active" && new Date(sub.expiresAt) > new Date()
    );

    const monthlyCount = activeSubscriptions.filter(sub => sub.plan === "monthly").length;
    const yearlyCount = activeSubscriptions.filter(sub => sub.plan === "yearly").length;

    return [
      { name: 'Monthly', value: monthlyCount, color: '#4361ee' },
      { name: 'Yearly', value: yearlyCount, color: '#3a0ca3' }
    ];
  }, [displayedSubscriptions]);

  const revenueChartData = React.useMemo(() => {
    const months = [];
    const values = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(date.toLocaleString('default', { month: 'short' }));

      const revenueItem = revenueData.find(item => item.month === monthKey);
      values.push(revenueItem ? Number(revenueItem.total || 0) : 0);
    }

    return months.map((month, index) => ({
      month,
      revenue: values[index]
    }));
  }, [revenueData]);

  const getStatusBadge = (subscription) => {
    if (subscription.status === 'active' && new Date(subscription.expiresAt) > new Date()) {
      return <Badge variant="default">Active</Badge>;
    } else if (subscription.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else {
      return <Badge variant="secondary">Expired</Badge>;
    }
  };

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
            <BreadcrumbPage>Manage Subscriptions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Subscriptions</h1>
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
            <CardHeader className="bg-yellow-500/10 border-b border-yellow-200 py-3">
              <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
                <Crown className="w-5 h-5" />
                Filter Subscriptions
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Amount Range
                  </label>
                  <Select
                    value={amountFilter}
                    onValueChange={setAmountFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="0-50">$0 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200+">$200+</SelectItem>
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
                  placeholder="Search subscriptions..."
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-linear-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${revenueData.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2)}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 mb-1">Active Subscriptions</p>
                    <h3 className="text-2xl font-bold">{displayedSubscriptions.filter(sub => sub.status === "active" && new Date(sub.expiresAt) > new Date()).length}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Crown className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-red-100 mb-1">Cancelled Subscriptions</p>
                    <h3 className="text-2xl font-bold">{displayedSubscriptions.filter(sub => sub.status === "cancelled").length}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="bg-green-500/10 border-b border-green-200 py-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                <Crown className="w-5 h-5" />
                All Subscriptions ({displayedSubscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedSubscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {subscription.user?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{subscription.user?.name}</div>
                            <div className="text-sm text-gray-500">{subscription.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscription.plan === 'monthly' ? 'default' : 'secondary'}>
                          {subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'}
                        </Badge>
                      </TableCell>
                      <TableCell>${subscription.amount?.toFixed(2)}</TableCell>
                      <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(subscription.expiresAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(subscription)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/user/${subscription.user?._id}`)}
                          >
                            View
                          </Button>
                          {subscription.status === 'active' && new Date(subscription.expiresAt) > new Date() && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">Cancel</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Cancel Subscription</DialogTitle>
                                  <DialogDescription>
                                  Are you sure you want to cancel the {subscription.plan} subscription for <strong>{subscription.user?.name}</strong>?
                                  <br />
                                  <span className="text-red-600">This action will immediately remove premium benefits from this user.</span>
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCancel(subscription._id)}
                                  >
                                    Cancel Subscription
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
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
                  <Crown className="w-5 h-5" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {planData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-purple-500/10 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 mt-2 text-purple-800">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Revenue (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
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