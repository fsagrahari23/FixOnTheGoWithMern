import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function MechanicHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
  const response = await apiGet('/mechanic/api/history');
  setBookings(response.bookings || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'in-progress': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Job History</h1>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/mechanic/booking/${booking._id}`}
              className="block bg-card hover:bg-accent rounded-lg p-6 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <p className="font-medium">{booking.user.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.serviceType}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </p>
                  {booking.payment && booking.status === 'completed' && (
                    <p className="text-sm text-muted-foreground">₹{booking.payment.amount}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs in history</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
