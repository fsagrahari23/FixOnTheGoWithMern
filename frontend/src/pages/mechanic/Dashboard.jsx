import { StatsCards } from "../../components/mechanic/dashboard/stats-cards";
import { ProfileSummary } from "../../components/mechanic/dashboard/profile-summary";
import { RecentBookings } from "../../components/mechanic/dashboard/recent-bookings";
import { NearbyRequests } from "../../components/mechanic/dashboard/nearby-requests";
import { EarningsChart } from "../../components/mechanic/dashboard/earnings-chart";
import { PerformanceStats } from "../../components/mechanic/dashboard/performance-stats";
import { QuickActions } from "../../components/mechanic/dashboard/quick-actions";
import MapPicker from "../../components/MapPicker";
import { useDispatch, useSelector } from 'react-redux';
import { setCoordinates, setAddress } from '../../store/slices/locationSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function MechanicDashboard() {
  const dispatch = useDispatch();
  const address = useSelector((s) => s.location?.address);

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
    <main className="min-h-screen bg-background dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentBookings />

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
      </div>
    </main>
  );
}
