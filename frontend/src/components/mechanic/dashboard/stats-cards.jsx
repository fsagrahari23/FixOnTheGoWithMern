import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMechanicDashboard } from '../../../store/slices/mechanicThunks';

export function StatsCards() {
  const dispatch = useDispatch();
  const { stats, earnings, loading, error } = useSelector((state) => state.mechanic);

  useEffect(() => {
    dispatch(fetchMechanicDashboard());
  }, [dispatch]);

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `₹${value.toFixed(2)}` : '₹0.00';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">Total Bookings</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-foreground">{stats.total || 0}</span>
          <span className="ml-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H4V20H8V10Z" fill="currentColor" />
              <path d="M14 4H10V20H14V4Z" fill="currentColor" />
              <path d="M20 12H16V20H20V12Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">Pending</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">In Progress</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1zM4 9a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1-1h-4a1 1 0 100 2h4a1 1 0 001-1zm-7 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">Completed</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.completed || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-green-500 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">Today's Earnings</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(earnings.today)}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-sm text-muted-foreground">Total Earnings</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(earnings.total)}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}