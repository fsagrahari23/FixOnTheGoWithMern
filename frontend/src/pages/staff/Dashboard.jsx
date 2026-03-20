import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
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
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export default function StaffDashboard() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`${API_BASE}/staff/dashboard`, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
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
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
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

                    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
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

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
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

                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
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
            </div>
        </main>
    )
}
