import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, IndianRupee, Wrench, Filter, Clock3 } from 'lucide-react';

export default function MechanicHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiGet('/mechanic/api/history');
        setBookings(response.bookings || []);
      } catch (error) {
        console.error('Error fetching history:', error);
        setError('Could not load booking history right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const name = booking?.user?.name || '';
      const problem = booking?.problemCategory || '';
      const description = booking?.description || '';
      const searchable = `${name} ${problem} ${description}`.toLowerCase();

      if (query && !searchable.includes(query.toLowerCase())) return false;
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

      if (dateFilter !== 'all') {
        const created = new Date(booking.createdAt);
        const days = (now - created) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today' && created.toDateString() !== now.toDateString()) return false;
        if (dateFilter === 'week' && days > 7) return false;
        if (dateFilter === 'month' && days > 30) return false;
      }

      return true;
    });
  }, [bookings, query, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const active = bookings.filter((b) => ['accepted', 'in-progress', 'pending'].includes(b.status)).length;
    const earnings = bookings.reduce((sum, b) => {
      if (b.status === 'completed' && b.payment?.status === 'completed') {
        return sum + (b.payment?.amount || 0);
      }
      return sum;
    }, 0);

    return { total, completed, active, earnings };
  }, [bookings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_45%)] bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-card border border-border" />
            ))}
          </div>
          <div className="mt-6 h-16 animate-pulse rounded-xl bg-card border border-border" />
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-card border border-border" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_45%)] bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-2xl border border-border/70 bg-card/70 backdrop-blur px-5 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Job History</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track all completed and past bookings with fast filters and search.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Latest first
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold">{stats.total}</p>
              <Wrench className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Completed</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              <CalendarDays className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Active</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-cyan-600">{stats.active}</p>
              <Filter className="h-5 w-5 text-cyan-500" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Earned (Completed)</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-violet-600">Rs {stats.earnings.toLocaleString()}</p>
              <IndianRupee className="h-5 w-5 text-violet-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, category, or description"
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/mechanic/booking/${booking._id}`}
              className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1.5">
                  <p className="text-base font-semibold group-hover:text-blue-700">{booking.user?.name || 'Unknown Customer'}</p>
                  <p className="text-sm text-muted-foreground">{booking.problemCategory || 'General service'}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{booking.description || 'No description available'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>

                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold">Payment</p>
                    <p>Rs {(booking.payment?.amount || 0).toLocaleString()}</p>
                    <p className="uppercase tracking-wide text-[10px] text-slate-500">{booking.payment?.status || 'pending'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredBookings.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <p className="text-base font-medium">No jobs matched your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try changing status/date filter or using a shorter search term.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
