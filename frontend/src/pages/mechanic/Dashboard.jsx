import { useEffect, useState } from "react";
import { StatsCards } from "../../components/mechanic/dashboard/stats-cards";
import { ProfileSummary } from "../../components/mechanic/dashboard/profile-summary";
import { RecentBookings } from "../../components/mechanic/dashboard/recent-bookings";
import { UserBookingSearch } from "../../components/mechanic/dashboard/user-booking-search";
import { NearbyRequests } from "../../components/mechanic/dashboard/nearby-requests";
import { EarningsChart } from "../../components/mechanic/dashboard/earnings-chart";
import { PerformanceStats } from "../../components/mechanic/dashboard/performance-stats";
import { QuickActions } from "../../components/mechanic/dashboard/quick-actions";
import {
  EarningsBreakdown,
  MonthlyTrend,
  RepeatCustomers,
  PerformanceSummary,
  StatusDistribution,
  RatingsDistribution,
  WeeklyPerformance
} from "../../components/mechanic/analytics";
import MapPicker from "../../components/MapPicker";
import { useDispatch, useSelector } from 'react-redux';
import { setCoordinates, setAddress } from '../../store/slices/locationSlice';
import { fetchMechanicAnalytics } from '../../store/slices/mechanicThunks';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function MechanicDashboard() {
  const dispatch = useDispatch();
  const address = useSelector((s) => s.location?.address);
  const { analytics, analyticsLoading } = useSelector((s) => s.mechanic);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    dispatch(fetchMechanicAnalytics()).finally(() => setLastSyncedAt(new Date()));

    const intervalId = setInterval(() => {
      dispatch(fetchMechanicAnalytics()).finally(() => setLastSyncedAt(new Date()));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleRefreshAnalytics = async () => {
    await dispatch(fetchMechanicAnalytics());
    setLastSyncedAt(new Date());
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const display = data.display_name || '';
      dispatch(setAddress(display));
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        dispatch(setCoordinates({ lat, lng }));
        await reverseGeocode(lat, lng);
      }, (err) => {
        console.error('Geolocation error:', err);
      }, { enableHighAccuracy: true });
    } else {
      alert('Geolocation is not available in your browser.');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_55%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_45%)] bg-background dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentBookings />
            <UserBookingSearch />

            <Card>
              <CardHeader>
                <CardTitle>Service Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Click on the map to pick your location or use the button to fetch your current location.</p>
                  <MapPicker onChange={async ({ lat, lng }) => {
                    dispatch(setCoordinates({ lat, lng }));
                    await reverseGeocode(lat, lng);
                  }} />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground truncate max-w-[640px]">{address || 'No location selected'}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleUseMyLocation} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition-colors">Use My Location</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <NearbyRequests />
            <EarningsChart />
          </div>

          <div className="space-y-6">
            <PerformanceStats />
            <ProfileSummary />
            <QuickActions />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8">
          <div className="mb-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Mechanic Analytics Hub</h2>
                  <p className="text-sm text-muted-foreground">Live performance, trends, ratings, and customer insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshAnalytics}
                  disabled={analyticsLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-xs text-muted-foreground">
                  {lastSyncedAt ? `Last sync ${lastSyncedAt.toLocaleTimeString()}` : 'Sync pending'}
                </span>
              </div>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceSummary data={analytics?.performance} />
                <StatusDistribution data={analytics?.statusDistribution} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MonthlyTrend data={analytics?.monthlyEarnings} />
                <WeeklyPerformance data={analytics?.weeklyPerformance} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EarningsBreakdown data={analytics?.earningsByCategory} />
                <RatingsDistribution data={analytics?.ratingDistribution} />
              </div>

              <RepeatCustomers data={analytics?.repeatCustomers} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
