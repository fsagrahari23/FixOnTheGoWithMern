import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign, CreditCard, Clock, TrendingUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Payment() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, completedPaymentsCount: 0, pendingPaymentsCount: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/payments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data.payments || []);
      setSubscriptions(data.subscriptions || []);
      setStats({
        totalAmount: data.totalAmount || 0,
        completedPaymentsCount: data.completedPaymentsCount || 0,
        pendingPaymentsCount: data.pendingPaymentsCount || 0,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchMatch = !search || payment.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                        payment.user?.email.toLowerCase().includes(search.toLowerCase()) ||
                        payment.mechanic?.name.toLowerCase().includes(search.toLowerCase()) ||
                        payment._id.toString().toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "all" || payment.payment?.status === statusFilter;
    const amount = payment.payment?.amount || 0;
    let amountMatch = true;
    if (amountFilter === "0-50") amountMatch = amount >= 0 && amount <= 50;
    else if (amountFilter === "50-100") amountMatch = amount > 50 && amount <= 100;
    else if (amountFilter === "100-200") amountMatch = amount > 100 && amount <= 200;
    else if (amountFilter === "200+") amountMatch = amount > 200;
    const dateMatch = (() => {
      const paymentDate = new Date(payment.updatedAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && toDate) {
        return paymentDate >= fromDate && paymentDate <= toDate;
      } else if (fromDate) {
        return paymentDate >= fromDate;
      } else if (toDate) {
        return paymentDate <= toDate;
      }
      return true;
    })();

    return searchMatch && statusMatch && amountMatch && dateMatch;
  });

  // Chart data preparation
  const revenueData = React.useMemo(() => {
    const months = [];
    const revenues = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleString('default', { month: 'short' }));
      revenues.push(0);
    }

    payments.forEach((payment) => {
      if (payment.payment?.status === 'completed') {
        const date = new Date(payment.updatedAt);
        const amount = payment.payment.amount;

        const currentDate = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(currentDate.getMonth() - 5);

        if (date >= sixMonthsAgo) {
          const monthIndex = currentDate.getMonth() - date.getMonth();
          const normalizedIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
          if (normalizedIndex < 6) {
            revenues[5 - normalizedIndex] += amount;
          }
        }
      }
    });

    return months.map((month, index) => ({
      month,
      revenue: revenues[index]
    }));
  }, [payments]);

  const statusData = React.useMemo(() => {
    const completed = payments.filter(p => p.payment?.status === 'completed').length;
    const pending = payments.filter(p => p.payment?.status === 'pending').length;

    return [
      { name: 'Completed', value: completed, color: '#38b000' },
      { name: 'Pending', value: pending, color: '#f8961e' }
    ];
  }, [payments]);

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
            <BreadcrumbPage>Manage Payments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Payments</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-linear-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${(Number(stats.totalAmount) || 0).toFixed(2)}</h3>
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
                    <p className="text-blue-100 mb-1">Completed Payments</p>
                    <h3 className="text-2xl font-bold">{stats.completedPaymentsCount}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-r from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-yellow-100 mb-1">Pending Payments</p>
                    <h3 className="text-2xl font-bold">{stats.pendingPaymentsCount}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="bg-green-500/10 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 mt-2 text-green-800">
                <CreditCard className="w-5 h-5" />
                Filter Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search payments..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount Range</label>
                  <Select value={amountFilter} onValueChange={setAmountFilter}>
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
                  <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-start-5">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="bg-blue-500/10 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 mt-2 text-blue-800">
                <CreditCard className="w-5 h-5" />
                Booking Payments ({filteredPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mechanic</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-mono text-sm">
                        {payment._id.toString().substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(payment.updatedAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(payment.updatedAt).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {payment.user?.name.charAt(0).toUpperCase()}
                          </div>
                          {payment.user?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                            {payment.mechanic?.name ? payment.mechanic.name.charAt(0).toUpperCase() : 'N'}
                          </div>
                          {payment.mechanic?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${payment.payment?.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.payment?.status === 'completed' ? 'default' : 'secondary'}>
                          {payment.payment?.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.payment?.transactionId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-yellow-500/10 border-b border-yellow-200">
              <CardTitle className="flex items-center gap-2 text-yellow-800 mt-2">
                <DollarSign className="w-5 h-5" />
                Subscription Payments ({subscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell className="font-mono text-sm">
                        {subscription._id.toString().substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(subscription.createdAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(subscription.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-medium">
                            {subscription.user?.name.charAt(0).toUpperCase()}
                          </div>
                          {subscription.user?.name}
                        </div>
                      </TableCell>
                      <TableCell>{subscription.user?.email}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${subscription.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
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
                <CardTitle className="flex items-center gap-2 text-cyan-800 mt-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#38b000"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-purple-500/10 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-purple-800 mt-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}