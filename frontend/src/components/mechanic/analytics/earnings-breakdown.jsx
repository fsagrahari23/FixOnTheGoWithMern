import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { PieChartIcon } from "lucide-react"

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"]

export function EarningsBreakdown({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Earnings by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <PieChartIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No earnings data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))

  const total = data.reduce((sum, item) => sum + item.earnings, 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Earnings by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="earnings"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
              />
              <Legend 
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary List */}
        <div className="mt-4 space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm truncate max-w-[120px]">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{item.count} jobs</span>
                <span className="font-medium text-green-600">₹{item.earnings.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">
                  ({((item.earnings / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
