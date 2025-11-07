import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Wrench, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { StatsOverview } from '../../components/admin/dashboard/stats-overview'
import { PremiumStats } from '../../components/admin/dashboard/premium-stats'
import { RecentBookings } from '../../components/admin/dashboard/recent-bookings'
import { PendingApprovals } from '../../components/admin/dashboard/pending-approvals'
import { PaymentOverview } from '../../components/admin/dashboard/payment-overview'
import { BookingChart } from '../../components/admin/dashboard/booking-chart'
import { PaymentChart } from '../../components/admin/dashboard/payment-chart'
import { RevenueChart } from '../../components/admin/dashboard/revenue-chart'

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState({
        userCount: 0,
        mechanicCount: 0,
        pendingMechanicCount: 0,
        bookingCount: 0,
        premiumUserCount: 0,
        subscriptionStats: { monthly: 0, yearly: 0 },
        paymentStats: { 
            totalRevenue: 0, 
            completed: 0, 
            pending: 0,
            subscriptionRevenue: 0 
        },
        bookingStats: {
            pending: 0,
            accepted: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
            emergency: 0
        },
        recentBookings: [],
        monthlyRevenueStats: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/admin/api/dashboard')
            const data = await response.json()
            setDashboardData(data)
            setLoading(false)
        } catch (error) {
            console.error('Error loading dashboard data:', error)
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
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
                <StatsOverview stats={dashboardData} />

                {/* Recent Bookings - Full Width */}
                <div className="mt-8">
                    <RecentBookings bookings={dashboardData.recentBookings} />
                </div>

                {/* Approvals & Premium Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <PendingApprovals count={dashboardData.pendingMechanicCount} />
                    <PremiumStats stats={dashboardData} />
                </div>

                {/* Charts Section - Payment + Booking + Revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <PaymentOverview stats={dashboardData.paymentStats} />
                    <BookingChart stats={dashboardData.bookingStats} />
                    <PaymentChart stats={dashboardData.paymentStats} />
                </div>

                {/* Revenue Chart - Full Width */}
                <div className="mt-8">
                    <RevenueChart monthlyStats={dashboardData.monthlyRevenueStats} />
                </div>
            </div>
        </main>
    )
}
