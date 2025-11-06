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
} from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminLayout() {
    const [activeTab, setActiveTab] = useState("dashboard")

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
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
                        { id: "profile", label: "Profile", url: "/admin/profile", icon: Users },
                    ]}
                    defaultActiveId="dashboard"
                    onTabChange={setActiveTab}
                    className="shrink-0"
                />

                <main className="flex-1 overflow-auto bg-background/80 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
