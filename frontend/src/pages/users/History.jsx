import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingHistory } from '../../store/slices/bookingThunks';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingHistory, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingHistory());
  }, [dispatch]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-amber-500',
        textColor: 'text-white',
        icon: Clock,
        label: 'Pending'
      },
      accepted: {
        color: 'bg-blue-500',
        textColor: 'text-white',
        icon: CheckCircle,
        label: 'Accepted'
      },
      'in-progress': {
        color: 'bg-purple-500',
        textColor: 'text-white',
        icon: Wrench,
        label: 'In Progress'
      },
      completed: {
        color: 'bg-green-500',
        textColor: 'text-white',
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-red-500',
        textColor: 'text-white',
        icon: XCircle,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your booking history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Error Loading History</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error.message || 'Failed to load booking history'}</p>
            <Button onClick={() => dispatch(fetchBookingHistory())} className="bg-blue-500 hover:bg-blue-600">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Booking History</h1>
          <p className="text-slate-600 dark:text-slate-400">View all your past and current bookings</p>
        </div>

        {bookingHistory && bookingHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Bookings Yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't made any bookings yet. Start by booking a mechanic service.</p>
            <Button onClick={() => navigate('/user/book')} className="bg-blue-500 hover:bg-blue-600">
              Book a Service
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookingHistory?.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={booking._id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border-0 shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                          {booking.problemCategory}
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Booking #{booking._id.slice(-8)}
                        </p>
                      </div>
                      <Badge className={`${statusConfig.color} ${statusConfig.textColor} px-4 py-2 flex items-center gap-2`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Date</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200">{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 truncate max-w-48">
                            {booking.location?.address || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mechanic</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200">
                            {booking.mechanic?.name || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Description:</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                        {booking.description}
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => navigate(`/user/booking/${booking._id}`)}
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
