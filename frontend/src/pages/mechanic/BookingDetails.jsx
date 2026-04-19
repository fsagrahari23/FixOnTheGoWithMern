import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../../lib/api';
import { getSocket } from '../../../libs/socket';
import BookingTrackingMap from '../../components/tracking/BookingTrackingMap';
import { useBookingTracker } from '../../hooks/useBookingTracker';
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
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Navigation,
  Banknote,
  StickyNote,
} from 'lucide-react';
import ChatModal from '../../components/users/ChatModal';

// ─── status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    step: 0,
  },
  accepted: {
    label: 'Accepted',
    dot: 'bg-cyan-400 animate-pulse',
    pill: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    step: 1,
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-blue-500 animate-pulse',
    pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    step: 2,
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-rose-400',
    pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    step: -1,
  },
};

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed'];

// ─── tiny reusable atoms ─────────────────────────────────────────────────────
function InfoCard({ icon: Icon, iconClass = 'text-slate-400', label, value, colSpan = '' }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${colSpan}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 transition-colors duration-200 group-hover:bg-slate-100">
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug break-words">{value || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, iconClass, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h2 className="text-[15px] font-bold tracking-tight text-slate-800">{title}</h2>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

// ─── progress stepper ─────────────────────────────────────────────────────────
function StatusStepper({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const currentStep = cfg.step;
  if (currentStep === -1) return null;

  return (
    <div className="mt-4 flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  done
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-200 bg-white'
                } ${active ? 'ring-4 ring-blue-100' : ''}`}
              >
                {done && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${done ? 'text-blue-600' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-1 mb-4 flex-1 h-0.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all duration-700 ease-out ${
                    i < currentStep ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── skeleton loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {[180, 240, 320].map((h) => (
              <div key={h} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="h-5 w-32 animate-pulse rounded-lg bg-slate-200 mb-5" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-16 animate-pulse rounded-2xl bg-slate-100 ${i === 2 || i === 3 ? 'col-span-2' : ''}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[200, 160].map((h) => (
              <div key={h} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function MechanicBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isTracking = ['accepted', 'in-progress'].includes(booking?.status);
  const { trackingData, setStaticUserCoordinates } = useBookingTracker({
    bookingId: id,
    isTracking,
    actorRole: 'mechanic',
  });

  // entry animation
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const fetchBookingDetails = useCallback(async () => {
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
  }, [id]);

  useEffect(() => { fetchBookingDetails(); }, [fetchBookingDetails]);

  useEffect(() => {
    if (!authUser?._id) return;
    const socket = getSocket();
    socket.emit('authenticate', authUser._id);
  }, [authUser?._id]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    const handler = (payload) => {
      if (!payload || String(payload.bookingId) !== String(id)) return;
      fetchBookingDetails();
    };
    socket.on('booking-status-changed', handler);
    return () => socket.off('booking-status-changed', handler);
  }, [id, fetchBookingDetails]);

  useEffect(() => {
    if (!booking?.location?.coordinates) return;
    setStaticUserCoordinates(booking.location.coordinates);
  }, [booking?.location?.coordinates, setStaticUserCoordinates]);

  // ── action handlers ──
  const handleAccept = async (e) => {
    e.preventDefault();
    try { await apiPost(`/mechanic/booking/${booking._id}/accept`); await fetchBookingDetails(); }
    catch { setError('Failed to accept booking'); }
  };
  const handleStart = async (e) => {
    e.preventDefault();
    try { await apiPost(`/mechanic/booking/${booking._id}/start`); await fetchBookingDetails(); }
    catch { setError('Failed to start service'); }
  };
  const handleComplete = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = fd.get('amount');
    if (!amount) { setError('Please enter the service amount'); return; }
    try { await apiPost(`/mechanic/booking/${booking._id}/complete`, { amount, notes: fd.get('notes') }); await fetchBookingDetails(); }
    catch { setError('Failed to complete service'); }
  };

  if (loading) return <SkeletonLoader />;

  if (!booking) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <ClipboardList className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Booking not found</h2>
          <p className="mt-2 text-sm text-slate-500">This booking may have been removed or is not accessible.</p>
          <button
            onClick={() => navigate('/mechanic/history')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back to History
          </button>
        </div>
      </main>
    );
  }

  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const isActive = ['accepted', 'in-progress'].includes(booking.status);
  const isDone = ['completed', 'cancelled'].includes(booking.status);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* ── animated error banner ── */}
      {error && (
        <div className="relative overflow-hidden border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm font-medium text-rose-700 animate-[slideDown_0.3s_ease-out]">
          {error}
          <button onClick={() => setError(null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      <div
        className={`mx-auto max-w-6xl px-4 py-8 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {/* ── header ── */}
        <div className="mb-6 rounded-3xl border border-slate-100 bg-white/90 backdrop-blur-md px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Booking Details</h1>
              <p className="mt-0.5 font-mono text-xs text-slate-400">#{booking._id}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${cfg.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                <CalendarClock className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
                {new Date(booking.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* stepper */}
          {booking.status !== 'cancelled' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <StatusStepper status={booking.status} />
            </div>
          )}
        </div>

        {/* ── two-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── LEFT column ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* customer details */}
            <Card>
              <SectionHeader icon={UserCircle2} iconClass="bg-blue-50 text-blue-600" title="Customer Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={UserCircle2} iconClass="text-blue-500" label="Name" value={booking.user?.name} />
                <InfoCard
                  icon={PhoneCall}
                  iconClass="text-emerald-500"
                  label="Phone"
                  value={booking.user?.phone}
                />
                <InfoCard
                  icon={MapPin}
                  iconClass="text-rose-500"
                  label="Address"
                  value={booking.location?.address}
                  colSpan="sm:col-span-2"
                />
              </div>
            </Card>

            {/* service details */}
            <Card>
              <SectionHeader icon={ClipboardList} iconClass="bg-indigo-50 text-indigo-600" title="Service Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={Wrench} iconClass="text-indigo-500" label="Category" value={booking.problemCategory || 'General service'} />
                <InfoCard icon={Clock} iconClass="text-amber-500" label="Status" value={cfg.label} />
                <InfoCard
                  icon={ClipboardList}
                  iconClass="text-slate-500"
                  label="Description"
                  value={booking.description || 'No description provided'}
                  colSpan="sm:col-span-2"
                />
                {booking.notes && (
                  <InfoCard
                    icon={StickyNote}
                    iconClass="text-orange-500"
                    label="Notes"
                    value={booking.notes}
                    colSpan="sm:col-span-2"
                  />
                )}
                <InfoCard
                  icon={CalendarClock}
                  iconClass="text-blue-500"
                  label="Created At"
                  value={new Date(booking.createdAt).toLocaleString()}
                  colSpan="sm:col-span-2"
                />
              </div>
            </Card>

            {/* live map */}
            {isActive && (
              <Card className="overflow-hidden">
                <SectionHeader icon={Navigation} iconClass="bg-violet-50 text-violet-600" title="Live Route To Customer" />
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <BookingTrackingMap
                    userCoordinates={trackingData.userCoordinates}
                    mechanicCoordinates={trackingData.mechanicCoordinates}
                    pathCoordinates={trackingData.pathCoordinates}
                    className="h-64 sm:h-80 md:h-[420px]"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Live tracking active ·{' '}
                  <span className="font-semibold text-slate-700">{trackingData.pathCoordinates?.length || 0}</span> path points
                </div>
              </Card>
            )}

            {/* images */}
            {booking.images?.length > 0 && (
              <Card>
                <SectionHeader icon={ImageIcon} iconClass="bg-fuchsia-50 text-fuchsia-600" title="Reference Images" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {booking.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(img, '_blank')}
                      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 aspect-video transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                    >
                      <img
                        src={img}
                        alt={`Reference ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                        <span className="text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">View</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ── RIGHT column ── */}
          <div className="space-y-6">

            {/* actions card */}
            <Card>
              <SectionHeader icon={Wrench} iconClass="bg-orange-50 text-orange-600" title="Actions" />

              <div className="flex flex-col gap-3">
                {/* chat button */}
                {isActive && booking.payment?.status !== 'completed' && (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 active:scale-95"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="h-5 w-5" />
                      Chat with Customer
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-60 transition-transform duration-200 group-hover:translate-x-1" />
                    <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full skew-x-12" />
                  </button>
                )}

                {/* accept */}
                {booking.status === 'pending' && (
                  <form onSubmit={handleAccept}>
                    <button
                      type="submit"
                      className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-slate-700 active:scale-95"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5" />
                        Accept Booking
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-60 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </form>
                )}

                {/* start */}
                {booking.status === 'accepted' && (
                  <form onSubmit={handleStart}>
                    <button
                      type="submit"
                      className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 active:scale-95"
                    >
                      <div className="flex items-center gap-2.5">
                        <Navigation className="h-5 w-5" />
                        Start Service
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-60 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </form>
                )}

                {/* complete */}
                {booking.status === 'in-progress' && (
                  <form onSubmit={handleComplete} className="space-y-3">
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <div className="flex items-center px-4 py-3 gap-2">
                        <Banknote className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <input
                          type="number"
                          name="amount"
                          required
                          placeholder="Service amount (Rs)"
                          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                        />
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="Service notes (optional)"
                        className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-md shadow-emerald-200 transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-300 active:scale-95"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5" />
                        Complete Service
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-60 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </form>
                )}

                {/* done state */}
                {isDone && (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${booking.status === 'completed' ? 'text-emerald-500' : 'text-rose-400'}`} />
                    <span>
                      Booking is <strong className="text-slate-700">{booking.status}</strong>. No further actions available.
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* payment card */}
            <Card>
              <SectionHeader icon={CircleDollarSign} iconClass="bg-emerald-50 text-emerald-600" title="Payment" />
              {booking.payment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Amount</span>
                    <span className="text-2xl font-extrabold tracking-tight text-emerald-700">
                      Rs {(booking.payment.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        booking.payment.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {booking.payment.status || 'pending'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                  <CircleDollarSign className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No payment details yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        bookingId={id}
        customer={booking?.user}
      />

      {/* global animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}