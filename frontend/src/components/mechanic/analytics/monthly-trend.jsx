import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

export function MonthlyTrend({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Monthly Earnings Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No earnings data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.earnings, 0)
  const avgMonthly = data.length > 0 ? total / data.length : 0

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          Monthly Earnings Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-xs text-muted-foreground">Total (6 mo)</p>
            <p className="text-lg font-bold text-green-600">₹{total.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <p className="text-xs text-muted-foreground">Avg/Month</p>
            <p className="text-lg font-bold text-blue-600">₹{avgMonthly.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <p className="text-lg font-bold text-purple-600">
              {data.reduce((sum, item) => sum + item.jobs, 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.substring(5)}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value, name) => [
                  name === "earnings" ? `₹${value.toLocaleString()}` : value,
                  name === "earnings" ? "Earnings" : "Jobs"
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
