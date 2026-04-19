import { Outlet } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { SidebarNav } from "../../components/users/UserSideBar"
import {
    Settings,
    Users,
    BarChart3,
    Bell,
} from "lucide-react"
import { useState } from "react"

export default function UserLayout() {
    const [activeTab, setActiveTab] = useState("dashboard")

    return (
        <div className="flex flex-col h-screen bg-background text-foreground dark:radial-glow">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
                <SidebarNav
                    tabs={[
                        { id: "dashboard", label: "Dashboard", url: "/user/dashboard", icon: BarChart3 },
                        { id: "booking_form", label: "Booking Form", url: "/user/booking_form", icon: Users },
                        { id: "emergency", label: "Emergency", url: "/user/emergency", icon: Bell },
                        { id: "history", label: "History", url: "/user/history", icon: BarChart3 },
                        { id: "maintenance", label: "Maintenance", url: "/user/maintenance", icon: Settings },
                        { id: "premium", label: "Premium", url: "/user/premium", icon: Settings },
                        { id: "profile", label: "Profile", url: "/user/profile", icon: Users },
                    ]}
                    defaultActiveId="dashboard"
                    onTabChange={setActiveTab}
                    className="flex-shrink-0"
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