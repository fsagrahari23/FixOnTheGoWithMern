import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  CreditCard,
  MessageSquare,
  XCircle,
  CheckCircle,
  UserCheck,
  Calendar,
  Image as ImageIcon,
  FileText,
  DollarSign,
  AlertCircle,
  Mail,
  AlertTriangle,
  ChevronRight,
  Navigation,
  Clock,
  Banknote,
  Wrench,
  User,
  Shield,
  Zap,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBookingDetails,
  selectMechanic,
  cancelBooking,
  rateBooking,
  processPayment,
} from '../../store/slices/bookingThunks';
import ChatModal from '../../components/users/ChatModal';
import PaymentModal from '../../components/users/PaymentModal';
import { RaiseDisputeDialog } from '../../components/users/dashboard/dispute-form';
import BookingTrackingMap from '../../components/tracking/BookingTrackingMap';
import { getSocket } from '../../../libs/socket';
import { useBookingTracker } from '../../hooks/useBookingTracker';

// ── status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: 'Pending',
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-400',
    step: 0,
  },
  accepted: {
    label: 'Accepted',
    pill: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500 animate-pulse',
    step: 1,
  },
  'in-progress': {
    label: 'In Progress',
    pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-600 animate-pulse',
    step: 2,
  },
  completed: {
    label: 'Completed',
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
    step: -1,
  },
};

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed'];

// ── small atoms ───────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, iconClass, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-[15px] font-bold tracking-tight text-slate-800">{title}</h2>
    </div>
  );
}

function InfoRow({ icon: Icon, iconClass = 'text-slate-400', label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      </div>
      <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-800 sm:text-right break-words">{value || '—'}</span>
      </div>
    </div>
  );
}

function ActionButton({ onClick, type = 'button', icon: Icon, label, variant = 'primary', disabled = false, className = '', children }) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700 shadow-md',
    blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200',
    rose: 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    'outline-rose': 'border border-rose-200 text-rose-600 hover:bg-rose-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-4.5 w-4.5" />}
        {label || children}
      </div>
      <ChevronRight className="h-4 w-4 opacity-50 transition-transform duration-200 group-hover:translate-x-1" />
      <span className="absolute inset-0 -translate-x-full bg-white/10 skew-x-12 transition-transform duration-500 group-hover:translate-x-full" />
    </button>
  );
}

// ── status stepper ────────────────────────────────────────────────────────────
function StatusStepper({ status }) {
  const cfg = STATUS[status];
  if (!cfg || cfg.step === -1) return null;
  const current = cfg.step;
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${done ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'} ${active ? 'ring-4 ring-blue-100' : ''}`}>
                {done && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${done ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-1 mb-4 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className={`absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all duration-700 ease-out ${i < current ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── star rating ───────────────────────────────────────────────────────────────
function StarRow({ value, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-transform duration-150 ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${interactive ? 'h-9 w-9' : 'h-5 w-5'} transition-colors duration-150 ${
              n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── mechanic card ─────────────────────────────────────────────────────────────
function MechanicCard({ mechanic, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(mechanic._id)}
      className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        selected ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {selected && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          <CheckCircle className="h-3 w-3" /> Selected
        </div>
      )}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Wrench className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-slate-800">{mechanic.name}</p>
          <p className="text-xs text-slate-500">Professional Mechanic</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRow value={Math.round(mechanic.rating)} />
            <span className="text-xs font-bold text-amber-600">{mechanic.rating?.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <Phone className="h-3.5 w-3.5 text-slate-400" /> {mechanic.phone}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 truncate">
          <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">{mechanic.email}</span>
        </div>
      </div>
    </div>
  );
}

// ── skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="h-8 w-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="rounded-3xl border border-slate-100 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200 mb-3" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="flex-1 h-1.5 animate-pulse rounded-full bg-slate-200" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {[180, 220, 300].map((h) => (
              <div key={h} className="rounded-3xl border border-slate-100 bg-white p-6">
                <div className="h-5 w-36 animate-pulse rounded-lg bg-slate-200 mb-5" />
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[160, 200].map((h) => (
              <div key={h} className="rounded-3xl border border-slate-100 bg-white p-6">
                <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200 mb-4" />
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBooking, nearbyMechanics, loading, error } = useSelector((s) => s.booking);
  const authUser = useSelector((s) => s.auth?.user);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedMechanicId, setSelectedMechanicId] = useState(null);
  const isTracking = ['accepted', 'in-progress'].includes(currentBooking?.status) && !!currentBooking?.mechanic;
  const { trackingData, setStaticUserCoordinates } = useBookingTracker({
    bookingId: id,
    isTracking,
    actorRole: 'user',
    mechanicId: currentBooking?.mechanic?._id || null,
  });

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  useEffect(() => {
    dispatch(fetchBookingDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!currentBooking?.location?.coordinates) return;
    setStaticUserCoordinates(currentBooking.location.coordinates);
  }, [currentBooking?.location?.coordinates, setStaticUserCoordinates]);

  useEffect(() => {
    if (!authUser?._id) return;
    getSocket().emit('authenticate', authUser._id);
  }, [authUser?._id]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    const onStatus = (p) => { if (p && String(p.bookingId) === String(id)) dispatch(fetchBookingDetails(id)); };
    const onNotif = (p) => {
      if (p?.data?.bookingId && String(p.data.bookingId) === String(id) && ['booking-accepted', 'booking-started'].includes(p.type))
        dispatch(fetchBookingDetails(id));
    };
    socket.on('booking-status-changed', onStatus);
    socket.on('notification', onNotif);
    return () => { socket.off('booking-status-changed', onStatus); socket.off('notification', onNotif); };
  }, [id, dispatch]);


  // ── handlers ──
  const handleRatingSubmit = () => dispatch(rateBooking({ bookingId: id, rating: selectedRating, comment }));

  const handleConfirmMechanic = useCallback(async () => {
    if (!selectedMechanicId) return;
    try {
      const result = await dispatch(selectMechanic({ id, mechanicId: selectedMechanicId })).unwrap();
      if (result.success) {
        dispatch(fetchBookingDetails(id));
        setSelectedMechanicId(null);
      }
    } catch (err) {
      console.error('Failed to assign mechanic:', err);
    }
  }, [selectedMechanicId, id, dispatch]);

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?'))
      dispatch(cancelBooking(id));
  };

  const handlePayment = useCallback(async (paymentMethodId) => {
    try {
      const result = await dispatch(processPayment({ bookingId: id, paymentMethodId })).unwrap();
      if (result.success) dispatch(fetchBookingDetails(id));
    } catch (err) {
      console.error('Payment failed:', err);
    }
  }, [id, dispatch]);

  if (loading && !currentBooking) return <Skeleton />;

  const bk = currentBooking;
  const cfg = STATUS[bk?.status] || STATUS.pending;
  const isActive = ['accepted', 'in-progress'].includes(bk?.status);
  const isDone = ['completed', 'cancelled'].includes(bk?.status);
  const canPay = bk?.status === 'completed' && bk?.payment?.status === 'pending';
  const canRate = bk?.status === 'completed' && bk?.payment?.status === 'completed' && !bk?.rating;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className={`mx-auto max-w-6xl px-4 py-8 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ── header ── */}
        <div className="mb-6 rounded-3xl border border-slate-100 bg-white/90 backdrop-blur-md px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                onClick={() => navigate('/user/dashboard')}
                className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </button>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Booking Details</h1>
              <p className="mt-0.5 font-mono text-xs text-slate-400">#{bk?._id}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${cfg.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                <Calendar className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
                {bk?.createdAt ? new Date(bk.createdAt).toLocaleString() : '—'}
              </div>
            </div>
          </div>
          {bk?.status !== 'cancelled' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <StatusStepper status={bk?.status} />
            </div>
          )}
        </div>

        {/* ── grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── LEFT ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* booking info */}
            <Card>
              <SectionHeader icon={FileText} iconClass="bg-blue-50 text-blue-600" title="Booking Information" />
              <InfoRow icon={Calendar} iconClass="text-blue-500" label="Date & Time" value={bk?.createdAt ? new Date(bk.createdAt).toLocaleString() : '—'} />
              <InfoRow icon={Wrench} iconClass="text-indigo-500" label="Problem Category" value={bk?.problemCategory} />
              <InfoRow icon={MapPin} iconClass="text-rose-500" label="Service Location" value={bk?.location?.address} />
              {bk?.description && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                  <p className="text-sm leading-relaxed text-slate-700">{bk.description}</p>
                </div>
              )}
            </Card>

            {/* mechanic info */}
            <Card>
              <SectionHeader icon={User} iconClass="bg-violet-50 text-violet-600" title="Mechanic Details" />
              {bk?.mechanic ? (
                <>
                  <InfoRow icon={User} iconClass="text-violet-500" label="Name" value={bk.mechanic.name} />
                  <InfoRow icon={Phone} iconClass="text-emerald-500" label="Phone" value={bk.mechanic.phone} />
                  <div className="flex items-start gap-3 py-2.5">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rating</span>
                      <div className="flex items-center gap-2">
                        <StarRow value={Math.round(bk.mechanic.rating)} />
                        <span className="text-xs font-bold text-amber-600">{bk.mechanic.rating}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Mechanic not assigned yet</p>
                    <p className="text-xs text-amber-600">We're finding the best mechanic for you</p>
                  </div>
                </div>
              )}
            </Card>

            {/* live map */}
            {isTracking && (
              <Card className="overflow-hidden">
                <SectionHeader icon={Navigation} iconClass="bg-violet-50 text-violet-600" title="Live Mechanic Tracking" />
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <BookingTrackingMap
                    userCoordinates={trackingData.userCoordinates}
                    mechanicCoordinates={trackingData.mechanicCoordinates}
                    pathCoordinates={trackingData.pathCoordinates}
                    className="h-64 sm:h-80 md:h-[400px]"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${trackingData.mechanicOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span>Mechanic {trackingData.mechanicOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <span>{trackingData.pathCoordinates?.length || 0} path points</span>
                </div>
              </Card>
            )}

            {/* images */}
            {bk?.images?.length > 0 && (
              <Card>
                <SectionHeader icon={ImageIcon} iconClass="bg-fuchsia-50 text-fuchsia-600" title="Attached Images" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bk.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(img, '_blank')}
                      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 aspect-video transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                    >
                      <img src={img} alt={`Booking image ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                        <span className="text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">View</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* nearby mechanics */}
            {bk?.status === 'pending' && !bk?.mechanic && (
              <Card>
                <SectionHeader icon={UserCheck} iconClass="bg-teal-50 text-teal-600" title="Available Mechanics Nearby" />
                {nearbyMechanics?.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Mechanics Available</p>
                    <p className="text-xs text-slate-500 text-center max-w-xs">No approved mechanics within 10km of your location. Please try again later.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {nearbyMechanics.map((m) => (
                        <MechanicCard key={m._id} mechanic={m} selected={selectedMechanicId === m._id} onSelect={setSelectedMechanicId} />
                      ))}
                    </div>
                    {selectedMechanicId && (
                      <div className="mt-5 animate-[slideDown_0.3s_ease-out]">
                        <ActionButton
                          onClick={handleConfirmMechanic}
                          icon={Zap}
                          label="Send Request to Mechanic"
                          variant="emerald"
                          disabled={loading}
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}

            {/* rating form */}
            {canRate && (
              <Card>
                <SectionHeader icon={Star} iconClass="bg-amber-50 text-amber-600" title="Rate Your Experience" />
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 py-4">
                    <StarRow value={selectedRating} interactive onChange={setSelectedRating} />
                    <p className="text-sm font-semibold text-slate-600">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating]}
                    </p>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Feedback (Optional)
                    </Label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                    />
                  </div>
                  <ActionButton onClick={handleRatingSubmit} icon={Star} label="Submit Rating" variant="primary" />
                </div>
              </Card>
            )}

            {/* existing rating */}
            {bk?.rating && (
              <Card>
                <SectionHeader icon={Star} iconClass="bg-amber-50 text-amber-600" title="Your Rating" />
                <div className="flex items-center gap-3 mb-3">
                  <StarRow value={bk.rating.value} />
                  <span className="text-xs text-slate-400">{new Date(bk.rating.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={`text-sm leading-relaxed ${bk.rating.comment ? 'text-slate-700' : 'italic text-slate-400'}`}>
                  {bk.rating.comment || 'No comment provided'}
                </p>
              </Card>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-6">

            {/* payment */}
            {bk?.payment && (
              <Card>
                <SectionHeader icon={DollarSign} iconClass="bg-emerald-50 text-emerald-600" title="Payment" />
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total</span>
                    <span className="text-2xl font-extrabold tracking-tight text-emerald-700">
                      ${bk.payment.amount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${bk.payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {bk.payment.status}
                    </span>
                  </div>
                  {bk.payment.transactionId && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                      <span className="font-semibold">Txn:</span> {bk.payment.transactionId}
                    </div>
                  )}
                </div>
                {canPay && (
                  <ActionButton onClick={() => setIsPaymentModalOpen(true)} icon={CreditCard} label="Make Payment Now" variant="emerald" />
                )}
                {bk.payment.status === 'completed' && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    <CheckCircle className="h-4 w-4" /> Payment completed
                  </div>
                )}
              </Card>
            )}

            {/* actions */}
            <Card>
              <SectionHeader icon={Shield} iconClass="bg-slate-100 text-slate-600" title="Actions" />
              <div className="flex flex-col gap-3">
                {/* chat */}
                {bk?.mechanic && !(bk?.status === 'completed' && bk?.payment?.status === 'completed') && (
                  <ActionButton onClick={() => setIsChatOpen(true)} icon={MessageSquare} label="Chat with Mechanic" variant="blue" />
                )}

                {/* cancel */}
                {(bk?.status === 'pending' || bk?.status === 'accepted') && (
                  <ActionButton onClick={handleCancelBooking} icon={XCircle} label="Cancel Booking" variant="rose" />
                )}

                {/* dispute */}
                {(bk?.status === 'completed' || bk?.status === 'in-progress') && !bk?.dispute?.hasDispute && (
                  <RaiseDisputeDialog
                    bookingId={bk?._id}
                    onSuccess={() => dispatch(fetchBookingDetails(id))}
                    trigger={
                      <button className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-rose-200 px-5 py-4 text-sm font-bold text-rose-600 transition-all duration-200 hover:bg-rose-50 active:scale-95">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="h-4.5 w-4.5" />
                          Raise Dispute
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    }
                  />
                )}

                {/* dispute status */}
                {bk?.dispute?.hasDispute && (
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    Dispute {bk.dispute.status}
                  </div>
                )}

                {isDone && !bk?.dispute?.hasDispute && !(canRate || canPay) && (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    <CheckCircle className={`h-5 w-5 flex-shrink-0 ${bk?.status === 'completed' ? 'text-emerald-500' : 'text-rose-400'}`} />
                    Booking is <strong className="text-slate-700 ml-1">{bk?.status}</strong>.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* modals */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} bookingId={bk?._id} mechanic={bk?.mechanic} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onPayment={handlePayment} amount={bk?.payment?.amount} bookingId={bk?._id} loading={loading} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default BookingDetails;
