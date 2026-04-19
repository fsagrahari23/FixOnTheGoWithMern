import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BarChart3, History, User } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { SidebarNav } from '../../components/users/UserSideBar';

export function MechanicLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground dark:radial-glow min-h-screen">
      {/* Top Navbar */}
      <Navbar userType="mechanic" />

      {/* Layout: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarNav
          tabs={[
            { id: "dashboard", label: "Dashboard", url: "/mechanic/dashboard", icon: BarChart3 },
            { id: "history", label: "History", url: "/mechanic/history", icon: History },
            { id: "profile", label: "Profile", url: "/mechanic/profile", icon: User },
          ]}
          defaultActiveId="dashboard"
          onTabChange={setActiveTab}
          className="flex-shrink-0"
        />

        <main className="flex-1 overflow-y-auto relative pb-24 lg:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Glass Container for Content */}
            <div className="premium-glass rounded-3xl p-6 min-h-[calc(100vh-160px)] shadow-2xl border border-white/5">
              <Outlet context={{ activeTab }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
