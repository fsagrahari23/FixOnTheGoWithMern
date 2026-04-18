import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../../lib/api';
import { getSocket } from '../../../libs/socket';
import BookingTrackingMap from '../../components/tracking/BookingTrackingMap';
import {
  ArrowLeft,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  ImageIcon,
  LocateFixed,
  PhoneCall,
  UserCircle2,
  Wrench,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatModal from '../../components/users/ChatModal';

export default function MechanicBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const geoWatchRef = useRef(null);
  const [trackingData, setTrackingData] = useState({
    userCoordinates: null,
    mechanicCoordinates: null,
    pathCoordinates: [],
  });

  const fetchBookingDetails = async () => {
    try {
      const response = await apiGet(`/mechanic/api/booking/${id}`);
      setBooking(response.booking);
      setError(null);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  useEffect(() => {
    if (!authUser?._id) return;

    const socket = getSocket();
    socket.emit('authenticate', authUser._id);
  }, [authUser?._id]);

  useEffect(() => {
    if (!id) return;

    const socket = getSocket();
    const handleBookingStatusChanged = (payload) => {
      if (!payload || String(payload.bookingId) !== String(id)) return;
      fetchBookingDetails();
    };

    socket.on('booking-status-changed', handleBookingStatusChanged);

    return () => {
      socket.off('booking-status-changed', handleBookingStatusChanged);
    };
  }, [id]);

  useEffect(() => {
    if (!booking?.location?.coordinates) return;
    setTrackingData((prev) => ({
      ...prev,
      userCoordinates: booking.location.coordinates,
    }));
  }, [booking?.location?.coordinates]);

  useEffect(() => {
    if (!id || !['accepted', 'in-progress'].includes(booking?.status)) {
      return;
    }

    const socket = getSocket();

    const handleSnapshot = (payload) => {
      if (!payload || String(payload.bookingId) !== String(id)) return;
      setTrackingData((prev) => ({
        ...prev,
        userCoordinates: payload.userCoordinates || prev.userCoordinates,
        mechanicCoordinates: payload.mechanicCoordinates || prev.mechanicCoordinates,
        pathCoordinates: payload.pathCoordinates || prev.pathCoordinates,
      }));
    };

    const handleTrackingUpdate = (payload) => {
      if (!payload || String(payload.bookingId) !== String(id)) return;
      setTrackingData((prev) => ({
        ...prev,
        userCoordinates: payload.userCoordinates || prev.userCoordinates,
        mechanicCoordinates: payload.mechanicCoordinates || prev.mechanicCoordinates,
        pathCoordinates: payload.pathCoordinates || prev.pathCoordinates,
      }));
    };

    socket.on('booking-tracking-snapshot', handleSnapshot);
    socket.on('booking-tracking-update', handleTrackingUpdate);
    socket.emit('join-booking-tracking', { bookingId: id });

    return () => {
      socket.emit('leave-booking-tracking', { bookingId: id });
      socket.off('booking-tracking-snapshot', handleSnapshot);
      socket.off('booking-tracking-update', handleTrackingUpdate);
    };
  }, [id, booking?.status]);

  useEffect(() => {
    if (!id || !['accepted', 'in-progress'].includes(booking?.status)) {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    const socket = getSocket();

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = [position.coords.longitude, position.coords.latitude];
        socket.emit('mechanic-location-update', { bookingId: id, coordinates });
      },
      () => {
        // silently ignore geolocation errors to avoid blocking other UI actions
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    return () => {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
    };
  }, [id, booking?.status]);

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      await apiPost(`/mechanic/booking/${booking._id}/accept`);
      await fetchBookingDetails();
    } catch (err) {
      console.error('Error accepting booking:', err);
      setError('Failed to accept booking');
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    try {
      await apiPost(`/mechanic/booking/${booking._id}/start`);
      await fetchBookingDetails();
    } catch (err) {
      console.error('Error starting service:', err);
      setError('Failed to start service');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = formData.get('amount');
    const notes = formData.get('notes');

    if (!amount) {
      setError('Please enter the service amount');
      return;
    }

    try {
      await apiPost(`/mechanic/booking/${booking._id}/complete`, { amount, notes });
      await fetchBookingDetails();
    } catch (err) {
      console.error('Error completing service:', err);
      setError('Failed to complete service');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusLabel = booking?.status
    ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
    : 'Unknown';

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_45%)] bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 w-52 animate-pulse rounded-lg bg-muted" />
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
              <div className="h-60 animate-pulse rounded-xl border border-border bg-card" />
            </div>
            <div className="space-y-6">
              <div className="h-52 animate-pulse rounded-xl border border-border bg-card" />
              <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">Booking not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">This booking may have been removed or is not accessible.</p>
            <button
              onClick={() => navigate('/mechanic/history')}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_45%)] bg-background">
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-center text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-2xl border border-border/70 bg-card/80 px-5 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-3 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Booking Details</h1>
              <p className="mt-1 text-sm text-muted-foreground">Booking ID: {booking._id}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                {statusLabel}
              </span>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">Created: </span>
                {new Date(booking.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <UserCircle2 className="h-5 w-5 text-blue-600" />
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="mt-1 font-semibold">{booking.user?.name || 'Not available'}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="mt-1 inline-flex items-center gap-2 font-semibold">
                    <PhoneCall className="h-4 w-4 text-cyan-600" />
                    {booking.user?.phone || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="mt-1 inline-flex items-start gap-2 font-semibold">
                    <LocateFixed className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <span>{booking.location?.address || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Service Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="mt-1 font-semibold">{booking.problemCategory || 'General service'}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 font-semibold leading-relaxed">{booking.description || 'No description provided'}</p>
                </div>

                {booking.notes && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="mt-1 font-semibold">{booking.notes}</p>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="mt-1 inline-flex items-center gap-2 font-semibold">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {['accepted', 'in-progress'].includes(booking?.status) && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                  <LocateFixed className="h-5 w-5 text-violet-600" />
                  Live Route To Customer
                </h2>
                <BookingTrackingMap
                  userCoordinates={trackingData.userCoordinates}
                  mechanicCoordinates={trackingData.mechanicCoordinates}
                  pathCoordinates={trackingData.pathCoordinates}
                  className="h-64 sm:h-80 md:h-[400px]"
                />
                <div className="mt-3 text-sm text-muted-foreground">
                  Your travel path points: <span className="font-semibold text-foreground">{trackingData.pathCoordinates?.length || 0}</span>
                </div>
              </div>
            )}

            {booking.images && booking.images.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                  <ImageIcon className="h-5 w-5 text-fuchsia-600" />
                  Reference Images
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booking.images.map((image, index) => (
                    <div key={index} className="group overflow-hidden rounded-lg border border-border">
                      <img
                        src={image}
                        alt={`Reference ${index + 1}`}
                        className="h-40 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Wrench className="h-5 w-5 text-orange-600" />
                Actions
              </h2>

              <p className="mb-4 text-sm text-muted-foreground">
                Update booking progress using the next valid action below.
              </p>

              <div className="flex flex-col gap-3">
                {['accepted', 'in-progress'].includes(booking.status) && (booking.payment?.status !== 'completed') && (
                  <Button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 py-6 rounded-xl shadow-md transition-all active:scale-95 font-bold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat with Customer
                  </Button>
                )}

                {booking.status === 'pending' && (
                <form onSubmit={handleAccept}>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Accept Booking
                  </button>
                </form>
              )}

              {booking.status === 'accepted' && (
                <form onSubmit={handleStart}>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Start Service
                  </button>
                </form>
              )}

              {booking.status === 'in-progress' && (
                <form onSubmit={handleComplete}>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Service Amount</label>
                      <input
                        type="number"
                        name="amount"
                        required
                        className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Notes</label>
                      <textarea
                        name="notes"
                        rows="3"
                        className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add service notes"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      Complete Service
                    </button>
                  </div>
                </form>
              )}

              {(booking.status === 'completed' || booking.status === 'cancelled') && (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  This booking is already {booking.status}. No further actions are available.
                </div>
              )}
            </div>
          </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <CircleDollarSign className="h-5 w-5 text-green-600" />
                Payment Details
              </h2>

              {booking.payment ? (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="mt-1 text-xl font-bold">Rs {(booking.payment.amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 font-semibold capitalize">{booking.payment.status || 'pending'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment details available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        bookingId={id}
        customer={booking?.user}
      />
    </main>
  );
}
