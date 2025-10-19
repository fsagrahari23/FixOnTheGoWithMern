"use client"

import { Outlet } from "react-router-dom"
import { Navbar } from "../../components/NavBar"
import { SidebarNav } from "../../components/users/UserSideBae"
import {
    Settings,
    Users,
    BarChart3,
    FileText,
    Bell,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function UserLayout() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isDark, setIsDark] = useState(false)

    // Toggle dark mode
    useEffect(() => {
        const htmlElement = document.documentElement
        if (isDark) htmlElement.classList.add("dark")
        else htmlElement.classList.remove("dark")
    }, [isDark])

    const navigationTabs = [
        { id: "dashboard", label: "Dashboard", url: "/user/dashboard", icon: BarChart3 },
        { id: "booking_details", label: "Booking Details", url: "/user/booking_details", icon: FileText },
        { id: "booking_form", label: "Booking Form", url: "/user/booking_form", icon: Users },
        { id: "emergency", label: "Emergency", url: "/user/emergency", icon: Bell },
        { id: "history", label: "History", url: "/user/history", icon: BarChart3 },
        { id: "maintenance", label: "Maintenance", url: "/user/maintenance", icon: Settings },
        { id: "premium", label: "Premium", url: "/user/premium", icon: Settings },
        { id: "profile", label: "Profile", url: "/user/profile", icon: Users },
    ]


    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Top Navbar */}
            <Navbar onThemeToggle={() => setIsDark(!isDark)} isDark={isDark} />

            {/* Layout: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
                {/* SidebarNav with collapse + responsive */}
                <SidebarNav
                    tabs={navigationTabs}
                    defaultActiveId="dashboard"
                    onTabChange={setActiveTab}
                    className="flex-shrink-0"
                />

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-background/80 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
