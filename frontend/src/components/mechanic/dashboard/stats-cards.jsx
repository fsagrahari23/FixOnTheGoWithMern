import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';

export function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    todayEarnings: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
  const response = await apiGet('/mechanic/api/dashboard');
  const { stats: fetchedStats, todayEarnings, totalEarnings } = response;
        setStats({
          total: fetchedStats?.total || 0,
          pending: fetchedStats?.pending || 0,
          inProgress: fetchedStats?.inProgress || 0,
          completed: fetchedStats?.completed || 0,
          cancelled: fetchedStats?.cancelled || 0,
          todayEarnings: todayEarnings || 0,
          totalEarnings: totalEarnings || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm text-gray-600">Total Bookings</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold">{stats.total || 0}</span>
          <span className="ml-2 flex items-center text-sm text-blue-600">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H4V20H8V10Z" fill="currentColor" />
              <path d="M14 4H10V20H14V4Z" fill="currentColor" />
              <path d="M20 12H16V20H20V12Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm text-gray-600">Pending</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm text-gray-600">In Progress</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-blue-600">{stats.inProgress || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1zM4 9a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1-1h-4a1 1 0 100 2h4a1 1 0 001-1zm-7 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm text-gray-600">Completed</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-green-600">{stats.completed || 0}</span>
          <span className="ml-2">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}