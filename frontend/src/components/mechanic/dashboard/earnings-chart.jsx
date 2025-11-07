import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EarningsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
  const response = await apiGet('/mechanic/api/dashboard');
  const bookings = response?.bookings || [];
        
        // Process bookings to get daily earnings
        const dailyEarnings = bookings.reduce((acc, booking) => {
          if (booking?.status === 'completed' && booking?.payment?.status === 'completed') {
            const date = new Date(booking.updatedAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + (booking.payment?.amount || 0);
          }
          return acc;
        }, {});

        // Convert to chart data format
        const chartData = Object.entries(dailyEarnings)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7); // Last 7 days

        setData(chartData);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      }
    };

    fetchEarningsData();
  }, []);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#2563eb" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}