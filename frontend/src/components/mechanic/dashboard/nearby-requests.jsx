import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';

export function NearbyRequests() {
  const [nearbyBookings, setNearbyBookings] = useState([]);

  useEffect(() => {
    const fetchNearbyBookings = async () => {
      try {
  const response = await apiGet('/mechanic/api/dashboard');
  setNearbyBookings(response?.nearbyBookings || []);
      } catch (error) {
        console.error('Error fetching nearby bookings:', error);
        setNearbyBookings([]);
      }
    };

    fetchNearbyBookings();
  }, []);

  const handleAcceptBooking = async (bookingId) => {
    try {
  await apiPost(`/mechanic/booking/${bookingId}/accept`);
  // Refresh the list
  const response = await apiGet('/mechanic/api/dashboard');
  setNearbyBookings(response.nearbyBookings);
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  if (nearbyBookings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Service Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nearbyBookings.map((booking) => (
            <div
              key={booking._id}
              className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{booking.user.name}</p>
                <p className="text-sm text-muted-foreground">{booking.serviceType}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/mechanic/booking/${booking._id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
                <Button onClick={() => handleAcceptBooking(booking._id)}>
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}