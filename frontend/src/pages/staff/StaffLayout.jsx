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
} from "lucide-react"
import { useState } from "react"

export default function StaffLayout() {
    const [activeTab, setActiveTab] = useState("dashboard")

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
                <SidebarNav
                    tabs={[
                        { id: "dashboard", label: "Dashboard", url: "/staff/dashboard", icon: BarChart3 },
                        { id: "mechanics", label: "Mechanic Applications", url: "/staff/mechanics", icon: UserCog },
                        { id: "disputes", label: "Disputes", url: "/staff/disputes", icon: AlertTriangle },
                        { id: "payments", label: "Payments", url: "/staff/payments", icon: CreditCard },
                        { id: "profile", label: "Profile", url: "/staff/profile", icon: Users },
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
