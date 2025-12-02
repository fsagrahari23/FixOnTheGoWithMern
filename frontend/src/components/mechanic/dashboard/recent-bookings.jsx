import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Link } from 'react-router-dom';

export function RecentBookings() {
  const { bookings: allBookings, loading: isLoading } = useSelector((state) => state.mechanic);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all | today | week | month

  useEffect(() => {
    if (allBookings && allBookings.length > 0) {
      setBookings(allBookings.slice(0, 5));
    } else {
      setBookings([]);
    }
  }, [allBookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            className="border rounded-md px-3 py-2 bg-background text-foreground"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background text-foreground"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {/* Derive categories from current bookings for simplicity */}
            {[...new Set(bookings.map(b => b.problemCategory))]
              .filter(Boolean)
              .map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background text-foreground"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="pb-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 px-4 font-medium text-muted-foreground">Problem Category</th>
                <th className="pb-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 px-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter((b) => {
                  // status filter
                  if (statusFilter !== 'all' && b.status !== statusFilter) return false;
                  // category filter
                  if (categoryFilter !== 'all' && b.problemCategory !== categoryFilter) return false;
                  // date filter
                  if (dateFilter !== 'all') {
                    const created = new Date(b.createdAt);
                    const now = new Date();
                    if (dateFilter === 'today') {
                      const isToday = created.toDateString() === now.toDateString();
                      if (!isToday) return false;
                    } else if (dateFilter === 'week') {
                      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
                      if (diffDays > 7) return false;
                    } else if (dateFilter === 'month') {
                      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
                      if (diffDays > 30) return false;
                    }
                  }
                  return true;
                })
                .map((booking) => (
                <tr 
                  key={booking._id} 
                  className="border-b border-border last:border-0 hover:bg-muted/50 dark:hover:bg-muted/20 group transition-colors duration-150 cursor-pointer"
                >
                  <td className="py-4 px-4">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    {booking.user.name}
                  </td>
                  <td className="py-4 px-4">
                      {booking.problemCategory}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Link 
                      to={`/mechanic/booking/${booking._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium rounded-md px-3 py-1 hover:bg-blue-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent bookings available</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}