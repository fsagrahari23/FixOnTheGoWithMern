import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Crown, Wrench, Users, BarChart3 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { StatsOverview } from '../../components/admin/dashboard/stats-overview'
import { PremiumStats } from '../../components/admin/dashboard/premium-stats'
import { RecentBookings } from '../../components/admin/dashboard/recent-bookings'
import { PendingApprovals } from '../../components/admin/dashboard/pending-approvals'
import { PaymentOverview } from '../../components/admin/dashboard/payment-overview'
import { BookingChart } from '../../components/admin/dashboard/booking-chart'
import { PaymentChart } from '../../components/admin/dashboard/payment-chart'
import { RevenueChart } from '../../components/admin/dashboard/revenue-chart'
import { TopProblems, TopMechanics, RepeatUsers, PerformanceMetrics } from '../../components/admin/analytics'
import { fetchAdminDashboard, fetchAdminAnalytics } from '../../store/slices/adminThunks'

export default function Dashboard() {
    const dispatch = useDispatch()
    const { dashboard, analytics, loading } = useSelector((state) => state.admin)

    useEffect(() => {
        dispatch(fetchAdminDashboard())
        dispatch(fetchAdminAnalytics())
    }, [dispatch])

    if (loading.dashboard) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <Crown className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/admin/mechanics">
                                <Button className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4" />
                                    Manage Mechanics
                                </Button>
                            </Link>
                            <Link to="/admin/users">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Manage Users
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <StatsOverview stats={dashboard} />

                {/* Recent Bookings - Full Width */}
                <div className="mt-6">
                    <RecentBookings bookings={dashboard.recentBookings} />
                </div>

                 {/* Revenue Chart - Full Width */}
                <div className="mt-6">
                    <RevenueChart monthlyStats={dashboard.monthlyRevenueStats} />
                </div>

                {/* Dashboard Cards Grid */}
                <div className="space-y-4 mt-6">
                    {/* Top row: Three equal-height cards */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <PendingApprovals count={dashboard.pendingMechanicCount} />
                        <BookingChart stats={dashboard.bookingStats} />
                        <PaymentChart stats={dashboard.paymentStats} />
                    </div>

                    {/* Bottom row: Two equal-width cards */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <PremiumStats stats={dashboard} />
                        <PaymentOverview stats={dashboard.paymentStats} />
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold">Analytics & Insights</h2>
                    </div>

                    {loading.analytics ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Performance Metrics - Full Width */}
                            <PerformanceMetrics data={analytics.performance} />

                            {/* Analytics Grid */}
                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                <TopProblems data={analytics.topProblems} />
                                <TopMechanics data={analytics.topMechanics} />
                            </div>

                            {/* Repeat Users - Full Width */}
                            <RepeatUsers data={analytics.repeatUsers} />
                        </div>
                    )}
                </div>
               
            </div>
        </main>
    )
}
