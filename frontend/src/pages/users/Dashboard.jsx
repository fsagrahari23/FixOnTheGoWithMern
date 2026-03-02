import { useEffect, useState } from "react";
import { CategoryBreakdown } from "../../components/users/dashboard/category_breakdown";
import { LocationMap } from "../../components/users/dashboard/location-map";
import { PremiumAlert } from "../../components/users/dashboard/premium-alert";
import { ProfileSummary } from "../../components/users/dashboard/profile-summary";
import { QuickActions } from "../../components/users/dashboard/quick-actions";
import { RecentBookings } from "../../components/users/dashboard/recent-bookings";
import { StatsCards } from "../../components/users/dashboard/stats-cards";
import { ProblemStats, SpendingBreakdown } from "../../components/users/analytics";
import { apiGet } from "../../lib/api";
import { BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await apiGet("/user/api/analytics");
        setAnalytics(res.data);
      } catch (e) {
        console.error("Failed to load user analytics:", e);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PremiumAlert />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentBookings />
            <LocationMap />
          </div>
          <div className="space-y-6">
            <CategoryBreakdown />
            <ProfileSummary />
            <QuickActions />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Your Insights</h2>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProblemStats data={analytics?.problemStats} />
              <SpendingBreakdown 
                data={analytics?.spendingByCategory} 
                summary={analytics?.summary}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
