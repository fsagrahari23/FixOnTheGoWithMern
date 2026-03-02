import { useState } from "react";
import { Search, User, Wrench, Mail, Phone, Calendar, Star, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AnalyticsSearch() {
  const [searchType, setSearchType] = useState("mechanic");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const endpoint = searchType === "mechanic" 
        ? `/admin/api/analytics/mechanic/search?email=${encodeURIComponent(email)}`
        : `/admin/api/analytics/user/search?email=${encodeURIComponent(email)}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch analytics");
      }

      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Search</h1>
        <p className="text-muted-foreground">
          Search by email to view detailed analytics for any mechanic or user
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Analytics
          </CardTitle>
          <CardDescription>
            Enter an email address to view detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <Tabs value={searchType} onValueChange={setSearchType}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger type="button" value="mechanic" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Mechanic
                </TabsTrigger>
                <TabsTrigger type="button" value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-4 max-w-xl">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder={`Enter ${searchType} email address...`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {data && searchType === "mechanic" && <MechanicResults data={data} />}
      {data && searchType === "user" && <UserResults data={data} />}
    </div>
  );
}

// Mechanic Results Component
function MechanicResults({ data }) {
  const { mechanic, profile, stats, analytics, recentBookings } = data || {};

  if (!mechanic) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No mechanic data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mechanic?.avatar} />
                <AvatarFallback className="text-lg">
                  {mechanic?.name?.charAt(0)?.toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{mechanic?.name || "Unknown"}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {mechanic?.email || "N/A"}
                  </span>
                  {mechanic?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {mechanic.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mechanic?.isApproved ? "default" : "secondary"}>
                {mechanic?.isApproved ? "Approved" : "Pending"}
              </Badge>
              {profile?.isAvailable && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Available
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-semibold">{profile.specialization?.join(", ") || "N/A"}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold">{profile.experience || 0} years</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="font-semibold">${profile.hourlyRate || 0}/hr</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {profile.rating?.toFixed(1) || "N/A"} ({profile.totalReviews || 0})
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Earnings by Category
              </CardTitle>
              <CardDescription>
                Total: ${analytics.performance?.totalEarnings?.toLocaleString() || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.earningsByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.earningsByCategory}
                      dataKey="earnings"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percent }) => 
                        `${category} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {analytics.earningsByCategory.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Earnings"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No earnings data</p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Earnings Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.monthlyEarnings?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Earnings"]} />
                    <Line type="monotone" dataKey="earnings" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No monthly data</p>
              )}
            </CardContent>
          </Card>

          {/* Problems Solved */}
          <Card>
            <CardHeader>
              <CardTitle>Problems Solved</CardTitle>
              <CardDescription>
                {analytics.performance?.totalJobs || 0} total jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.earningsByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.earningsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Repeat Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Repeat Customers</CardTitle>
              <CardDescription>
                {analytics.repeatCustomers?.length || 0} returning customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {analytics.repeatCustomers?.length > 0 ? (
                  analytics.repeatCustomers.map((customer, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{customer.bookings} bookings</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-10">No repeat customers yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Last 10 service requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings?.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{booking.problemCategory}</Badge>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.problemDescription?.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Customer: {booking.user?.name || "N/A"} • {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${booking.payment?.amount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.payment?.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// User Results Component
function UserResults({ data }) {
  const { user, subscription, analytics, recentBookings } = data || {};

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No user data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user?.name || "Unknown"}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email || "N/A"}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge variant={user?.isPremium ? "default" : "secondary"}>
              {user?.isPremium ? "Premium" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        {subscription && (
          <CardContent>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Active Subscription</p>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="font-bold capitalize">{subscription.plan} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xl font-bold">${subscription.amount}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats */}
      {analytics?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{analytics.summary.totalBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">
                ${analytics.summary.totalSpent?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Most Common Issue</p>
              <p className="text-lg font-bold truncate">{analytics.summary.mostCommonProblem}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Highest Spend</p>
              <p className="text-lg font-bold truncate">{analytics.summary.highestSpendCategory}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Problems Faced</CardTitle>
              <CardDescription>Service categories breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.problemStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.problemStats}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percent }) => 
                        `${category} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {analytics.problemStats.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Spending Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Breakdown</CardTitle>
              <CardDescription>Money spent by category</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.spendingByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.spendingByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Spent"]} />
                    <Bar dataKey="spent" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No spending data</p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Booking and spending trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.monthlyActivity?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "spent" ? `$${value.toLocaleString()}` : value,
                        name === "spent" ? "Amount Spent" : "Bookings"
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#0088FE" strokeWidth={2} name="Bookings" />
                    <Line yAxisId="right" type="monotone" dataKey="spent" stroke="#00C49F" strokeWidth={2} name="spent" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10">No activity data</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Last 10 service requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings?.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{booking.problemCategory}</Badge>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.problemDescription?.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mechanic: {booking.mechanic?.name || "Not assigned"} • {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${booking.payment?.amount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.payment?.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const variants = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "in-progress": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}
