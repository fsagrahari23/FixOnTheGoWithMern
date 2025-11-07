import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  pending: '#F59E0B',
  'in-progress': '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444'
};

export function PerformanceStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
  const res = await apiGet('/mechanic/api/dashboard');
  const bookings = res?.bookings || [];
        const counts = bookings.reduce((acc, b) => {
          const s = b.status || 'unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(counts).map(([key, value]) => ({ name: key, value }));
        setData(chartData);
      } catch (err) {
        console.error('Error fetching performance stats:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No booking data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#60A5FA'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
