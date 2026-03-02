import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { IndianRupee } from "lucide-react"

const COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"]

export function SpendingBreakdown({ data = [], summary = {} }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            Your Spending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <IndianRupee className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No spending data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))

  const total = data.reduce((sum, item) => sum + item.spent, 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
          Your Spending
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Total Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold text-green-600">${total.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-xs text-muted-foreground">Services Used</p>
            <p className="text-xl font-bold text-blue-600">{summary.totalBookings || 0}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="spent"
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
                formatter={(value) => [`$${value.toLocaleString()}`, "Spent"]}
              />
              <Legend 
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Category */}
        {data.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm">
              <span className="font-medium">💰 Top Expense:</span>{" "}
              <span className="text-muted-foreground">
                "{data[0].category}" — ${data[0].spent.toLocaleString()} 
                ({((data[0].spent / total) * 100).toFixed(0)}% of total)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
