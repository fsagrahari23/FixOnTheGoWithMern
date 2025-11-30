import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Link } from 'react-router-dom';

export function CurrentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
  const res = await apiGet('/mechanic/api/dashboard');
  const items = res?.currentBookings || res?.bookings || [];
        // show next 5 upcoming/current bookings
        setBookings(Array.isArray(items) ? items.slice(0, 5) : []);
      } catch (err) {
        console.error('Error fetching current bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading current bookings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No current bookings</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">Date</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Problem</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="py-3">{new Date(b.createdAt || b.date).toLocaleDateString()}</td>
                    <td className="py-3">{b.user?.name || b.customerName || '—'}</td>
                    <td className="py-3">{b.serviceType || b.problem || '—'}</td>
                    <td className="py-3">{b.status}</td>
                    <td className="py-3"><Link to={`/mechanic/booking/${b._id}`} className="text-blue-600">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
