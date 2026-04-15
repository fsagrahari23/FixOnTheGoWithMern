import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    UserCog,
    AlertTriangle,
    CreditCard,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Shield,
    Activity,
    ChartNoAxesCombined,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export default function StaffDashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState(null)

    const STATUS_COLORS = {
        pending: '#f59e0b',
        accepted: '#06b6d4',
        'in-progress': '#3b82f6',
        completed: '#10b981',
        cancelled: '#ef4444',
        unknown: '#64748b',
    }

    const PAYMENT_COLORS = {
        pending: '#f59e0b',
        completed: '#22c55e',
        refunded: '#a855f7',
    }

    useEffect(() => {
        fetchDashboard()
        fetchAnalytics()
    }, [])

    const handleAuthErrorRedirect = async (response) => {
        if (!response.ok) return false
        return true
    }

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`${API_BASE}/staff/dashboard`, {
                credentials: 'include',
            })
            await handleAuthErrorRedirect(response)
            if (!response.ok) {
                let message = 'Failed to fetch dashboard data'
                try {
                    const errorBody = await response.json()
                    message = errorBody?.message || errorBody?.error || message

                    if (response.status === 403 && errorBody?.mustChangePassword) {
                        navigate('/staff/change-password', { replace: true })
                        return
                    }
                } catch {
                    // keep default message if response body is not JSON
                }

                throw new Error(message)
            }
            const data = await response.json()
            setDashboardData(data.dashboard)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_BASE}/staff/analytics`, {
                credentials: 'include',
            })
            await handleAuthErrorRedirect(response)
            if (!response.ok) {
                let message = 'Failed to fetch analytics data'
                try {
                    const errorBody = await response.json()
                    message = errorBody?.message || errorBody?.error || message

                    if (response.status === 403 && errorBody?.mustChangePassword) {
                        navigate('/staff/change-password', { replace: true })
                        return
                    }
                } catch {
                    // keep default
                }
                throw new Error(message)
            }

            const data = await response.json()
            setAnalyticsData(data.analytics)
        } catch (err) {
            console.error('Staff analytics fetch error:', err)
        } finally {
            setAnalyticsLoading(false)
        }
    }

    const formatMonth = (monthKey) => {
        if (!monthKey) return ''
        const [year, month] = monthKey.split('-')
        const date = new Date(Number(year), Number(month) - 1, 1)
        return date.toLocaleDateString('en-IN', { month: 'short' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={fetchDashboard}>Retry</Button>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Shield className="w-8 h-8 text-blue-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold">Staff Dashboard</h1>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/staff/mechanics">
                                <Button className="flex items-center gap-2">
                                    <UserCog className="w-4 h-4" />
                                    Review Applications
                                </Button>
                            </Link>
                            <Link to="/staff/disputes">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    View Disputes
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-linear-to-r from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-orange-100 mb-1">Pending Applications</p>
                                    <h3 className="text-3xl font-bold">
                                        {dashboardData?.pendingMechanicsCount || 0}
                                    </h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <UserCog className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-r from-red-500 to-red-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-red-100 mb-1">Active Disputes</p>
                                    <h3 className="text-3xl font-bold">
                                        {dashboardData?.disputedBookingsCount || 0}
                                    </h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-r from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-green-100 mb-1">Total Revenue</p>
                                    <h3 className="text-3xl font-bold">
                                        ₹{(dashboardData?.paymentStats?.totalRevenue || 0).toLocaleString()}
                                    </h3>
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
                                    <h3 className="text-3xl font-bold">
                                        {dashboardData?.paymentStats?.completed || 0}
                                    </h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Mechanic Applications */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-orange-500" />
                                Pending Mechanic Applications
                            </CardTitle>
                            <Link to="/staff/mechanics">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {dashboardData?.pendingMechanics?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.pendingMechanics.slice(0, 5).map((mechanic) => (
                                        <div
                                            key={mechanic._id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div>
                                                <p className="font-medium">{mechanic.user?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {mechanic.user?.email}
                                                </p>
                                            </div>
                                            <Link to={`/staff/mechanic/${mechanic.user?._id}`}>
                                                <Button size="sm" variant="outline">
                                                    Review
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No pending applications
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Disputes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Recent Disputes
                            </CardTitle>
                            <Link to="/staff/disputes">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {dashboardData?.disputedBookings?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.disputedBookings.slice(0, 5).map((booking) => (
                                        <div
                                            key={booking._id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {booking.user?.name} vs {booking.mechanic?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.dispute?.reason || 'Dispute'}
                                                </p>
                                            </div>
                                            <Badge variant="destructive">
                                                {booking.dispute?.status || 'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No active disputes
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Payments */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-500" />
                                Recent Payments
                            </CardTitle>
                            <Link to="/staff/payments">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {dashboardData?.recentPayments?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2">User</th>
                                                <th className="text-left py-3 px-2">Mechanic</th>
                                                <th className="text-left py-3 px-2">Amount</th>
                                                <th className="text-left py-3 px-2">Status</th>
                                                <th className="text-left py-3 px-2">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.recentPayments.slice(0, 5).map((payment) => (
                                                <tr key={payment._id} className="border-b">
                                                    <td className="py-3 px-2">{payment.user?.name}</td>
                                                    <td className="py-3 px-2">
                                                        {payment.mechanic?.name || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        ₹{payment.payment?.amount || 0}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Badge
                                                            variant={
                                                                payment.payment?.status === 'completed'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {payment.payment?.status || 'pending'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-2 text-muted-foreground">
                                                        {new Date(payment.updatedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No recent payments
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Section */}
                <div className="mt-10">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-sky-500/10 p-2">
                            <ChartNoAxesCombined className="h-6 w-6 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Staff Analytics Center</h2>
                            <p className="text-sm text-muted-foreground">
                                End-to-end visibility across bookings, payments, disputes, and mechanic approvals.
                            </p>
                        </div>
                    </div>

                    {analyticsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-5">
                                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                                            {analyticsData?.summary?.completionRate || 0}%
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <p className="text-xs text-muted-foreground">Open Disputes</p>
                                        <p className="mt-1 text-2xl font-bold text-rose-600">
                                            {analyticsData?.summary?.openDisputes || 0}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <p className="text-xs text-muted-foreground">Pending Certifications</p>
                                        <p className="mt-1 text-2xl font-bold text-amber-600">
                                            {analyticsData?.summary?.pendingCertifications || 0}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                                        <p className="mt-1 text-2xl font-bold text-blue-600">
                                            ₹{(analyticsData?.summary?.totalRevenue || 0).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-500" />
                                            Booking Status Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analyticsData?.bookingStatusDistribution || []}
                                                        dataKey="count"
                                                        nameKey="status"
                                                        innerRadius={65}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                    >
                                                        {(analyticsData?.bookingStatusDistribution || []).map((entry, index) => (
                                                            <Cell
                                                                key={`status-${index}`}
                                                                fill={STATUS_COLORS[entry.status] || STATUS_COLORS.unknown}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-emerald-500" />
                                            Payment Status & Revenue
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analyticsData?.paymentStatusDistribution || []}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="status" />
                                                    <YAxis />
                                                    <Tooltip
                                                        formatter={(value, name) => {
                                                            if (name === 'amount') return [`₹${Number(value).toLocaleString()}`, 'Revenue']
                                                            return [value, 'Count']
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="count" name="Transactions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="amount" name="Revenue" radius={[4, 4, 0, 0]}>
                                                        {(analyticsData?.paymentStatusDistribution || []).map((entry, index) => (
                                                            <Cell
                                                                key={`payment-${index}`}
                                                                fill={PAYMENT_COLORS[entry.status] || '#6366f1'}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-violet-500" />
                                            Monthly Operations Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={(analyticsData?.monthlyTrends || []).map((item) => ({ ...item, label: formatMonth(item.month) }))}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis />
                                                    <Tooltip
                                                        formatter={(value, name) => {
                                                            if (name === 'revenue') return [`₹${Number(value).toLocaleString()}`, 'Revenue']
                                                            if (name === 'disputes') return [value, 'Disputes']
                                                            return [value, 'Bookings']
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.25} />
                                                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.2} />
                                                    <Area type="monotone" dataKey="disputes" name="disputes" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <UserCog className="w-5 h-5 text-indigo-500" />
                                            Mechanic Application vs Approval Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={(analyticsData?.mechanicApprovalTrend || []).map((item) => ({ ...item, label: formatMonth(item.month) }))}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Top Problem Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(analyticsData?.topProblemCategories || []).map((item, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                                                    <div>
                                                        <p className="font-medium">{item.category}</p>
                                                        <p className="text-xs text-muted-foreground">{item.count} bookings</p>
                                                    </div>
                                                    <p className="font-semibold text-emerald-600">₹{(item.revenue || 0).toLocaleString()}</p>
                                                </div>
                                            ))}
                                            {(analyticsData?.topProblemCategories || []).length === 0 && (
                                                <p className="text-sm text-muted-foreground">No problem category data available</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Dispute Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(analyticsData?.disputeCategories || []).map((item, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                                                    <p className="font-medium capitalize">{String(item.category || 'other').replaceAll('_', ' ')}</p>
                                                    <Badge variant="destructive">{item.count}</Badge>
                                                </div>
                                            ))}
                                            {(analyticsData?.disputeCategories || []).length === 0 && (
                                                <p className="text-sm text-muted-foreground">No active dispute category data</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
