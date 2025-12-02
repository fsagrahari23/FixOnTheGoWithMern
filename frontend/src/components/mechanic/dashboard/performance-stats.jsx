import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const { bookings, loading } = useSelector((state) => state.mechanic);

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const counts = bookings.reduce((acc, b) => {
        const s = b.status || 'unknown';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(counts).map(([key, value]) => ({ name: key, value }));
      setData(chartData);
    }
  }, [bookings]);

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
