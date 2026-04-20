"use client"
import { Outlet } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { SidebarNav } from "../../components/users/UserSideBar"
import {
    Settings,
    Users,
    UserCog,
    BarChart3,
    AlertTriangle,
    CreditCard,
    Shield,
    MessageCircle,
    FileText,
} from "lucide-react"
import { useState } from "react"

export default function StaffLayout() {
    const [, setActiveTab] = useState("dashboard")

    return (
        <div className="flex flex-col h-screen bg-background text-foreground dark:radial-glow">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
                <SidebarNav
                    tabs={[
                        { id: "dashboard", label: "Dashboard", url: "/staff/dashboard", icon: BarChart3 },
                        { id: "chats", label: "Support Chats", url: "/staff/chats", icon: MessageCircle },
                        { id: "mechanics", label: "Mechanic Applications", url: "/staff/mechanics", icon: UserCog },
                        { id: "profile-updation", label: "Profile Update Request", url: "/staff/profile-updation", icon: FileText },
                        { id: "disputes", label: "Disputes", url: "/staff/disputes", icon: AlertTriangle },
                        { id: "payments", label: "Payments", url: "/staff/payments", icon: CreditCard },
                        { id: "profile", label: "Profile", url: "/staff/profile", icon: Users },
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
