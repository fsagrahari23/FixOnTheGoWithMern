"use client"
import { Outlet } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { SidebarNav } from "../../components/users/UserSideBar"
import {
    Settings,
    Users,
    UserCog,
    BarChart3,
    BookCheck,
    Bell,
    Shield,
    Search,
} from "lucide-react"
import { useState } from "react"

export default function AdminLayout() {
    const [, setActiveTab] = useState("dashboard")

    return (
        <div className="flex flex-col h-screen bg-background text-foreground dark:radial-glow">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
                <SidebarNav
                    tabs={[
                        { id: "dashboard", label: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
                        { id: "booking_details", label: "Users", url: "/admin/users", icon: Users },
                        { id: "booking_form", label: "Mechanics", url: "/admin/mechanics", icon:UserCog  },
                        { id: "emergency", label: "Bookings", url: "/admin/bookings", icon: BookCheck },
                        { id: "history", label: "Payments", url: "/admin/payments", icon: BarChart3 },
                        { id: "maintenance", label: "Subscriptions", url: "/admin/subscriptions", icon: Settings },
                        { id: "staff", label: "Staff", url: "/admin/staff", icon: Shield },
                        { id: "analytics-search", label: "Analytics Search", url: "/admin/analytics-search", icon: Search },
                        { id: "profile", label: "Profile", url: "/admin/profile", icon: Users },
                    ]}
                    defaultActiveId="dashboard"
                    onTabChange={setActiveTab}
                    className="shrink-0"
                />

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                    <div className="max-w-7xl mx-auto dark:premium-glass rounded-3xl p-1 md:p-2">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
