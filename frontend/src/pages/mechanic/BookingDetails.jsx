import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../../lib/api';

export default function MechanicBookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
  const response = await apiGet(`/mechanic/api/booking/${id}`);
  setBooking(response.booking);
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {booking.user.name}</p>
                <p><span className="font-medium">Phone:</span> {booking.user.phone}</p>
                <p><span className="font-medium">Address:</span> {booking.address}</p>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Service Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Type:</span> {booking.serviceType}</p>
                <p><span className="font-medium">Status:</span> {booking.status}</p>
                <p><span className="font-medium">Created:</span> {new Date(booking.createdAt).toLocaleString()}</p>
                {booking.notes && (
                  <p><span className="font-medium">Notes:</span> {booking.notes}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Actions</h2>
              {booking.status === 'pending' && (
                <form action={`/mechanic/booking/${booking._id}/accept`} method="POST">
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded"
                  >
                    Accept Booking
                  </button>
                </form>
              )}

              {booking.status === 'accepted' && (
                <form action={`/mechanic/booking/${booking._id}/start`} method="POST">
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded"
                  >
                    Start Service
                  </button>
                </form>
              )}

              {booking.status === 'in-progress' && (
                <form action={`/mechanic/booking/${booking._id}/complete`} method="POST">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Service Amount</label>
                      <input
                        type="number"
                        name="amount"
                        required
                        className="w-full border rounded p-2"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        name="notes"
                        rows="3"
                        className="w-full border rounded p-2"
                        placeholder="Add service notes"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded"
                    >
                      Complete Service
                    </button>
                  </div>
                </form>
              )}
            </div>

            {booking.status === 'completed' && booking.payment && (
              <div className="bg-card rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Amount:</span> ₹{booking.payment.amount}</p>
                  <p><span className="font-medium">Status:</span> {booking.payment.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
