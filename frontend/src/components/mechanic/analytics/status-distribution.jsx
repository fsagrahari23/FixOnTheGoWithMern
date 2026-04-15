import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Gauge } from "lucide-react"

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b" },
  accepted: { label: "Accepted", color: "#0ea5e9" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  completed: { label: "Completed", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  unknown: { label: "Other", color: "#6b7280" }
}

export function StatusDistribution({ data = [] }) {
  if (!data?.length) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
            Job Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">No status data yet</CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    ...item,
    label: STATUS_CONFIG[item.status]?.label || "Other",
    fill: STATUS_CONFIG[item.status]?.color || STATUS_CONFIG.unknown.color
  }))

  const totalJobs = chartData.reduce((sum, item) => sum + (item.count || 0), 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
          Job Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`status-cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value) => [`${value} jobs`, "Count"]}
              />
              <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Total jobs tracked: <span className="font-semibold text-foreground">{totalJobs}</span>
        </div>
      </CardContent>
    </Card>
  )
}
