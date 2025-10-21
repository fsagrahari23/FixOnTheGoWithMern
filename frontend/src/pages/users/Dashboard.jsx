import { CategoryBreakdown } from "../../components/users/dashboard/category_breakdown";
import { LocationMap } from "../../components/users/dashboard/location-map";
import { PremiumAlert } from "../../components/users/dashboard/premium-alert";
import { ProfileSummary } from "../../components/users/dashboard/profile-summary";
import { QuickActions } from "../../components/users/dashboard/quick-actions";
import { RecentBookings } from "../../components/users/dashboard/recent-bookings";
import { StatsCards } from "../../components/users/dashboard/stats-cards";

export default function Dashboard() {
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
      </div>
    </main>
  )
}
