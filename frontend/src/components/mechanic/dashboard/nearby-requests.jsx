import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';
import { acceptBooking, fetchMechanicDashboard } from '../../../store/slices/mechanicThunks';

export function NearbyRequests() {
  const dispatch = useDispatch();
  const { nearbyBookings, loading } = useSelector((state) => state.mechanic);

  const handleAcceptBooking = async (bookingId) => {
    try {
      const result = await dispatch(acceptBooking(bookingId)).unwrap();
      if (result.success) {
        alert('Booking accepted successfully!');
        // Refresh dashboard data
        dispatch(fetchMechanicDashboard());
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert(error || 'Failed to accept booking');
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
                <Button 
                  onClick={() => handleAcceptBooking(booking._id)}
                  disabled={loading}
                >
                  {loading ? 'Accepting...' : 'Accept'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}