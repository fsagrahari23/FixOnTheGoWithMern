import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { ChartNoAxesCombined } from "lucide-react"

export function WeeklyPerformance({ data = [] }) {
  if (!data?.length) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ChartNoAxesCombined className="w-4 h-4 sm:w-5 sm:h-5" />
            Weekly Performance (8 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">No weekly trend data yet</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <ChartNoAxesCombined className="w-4 h-4 sm:w-5 sm:h-5" />
          Weekly Performance (8 Weeks)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `Rs ${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value, name) => {
                  if (name === "earnings") return [`Rs ${Number(value).toLocaleString()}`, "Earnings"]
                  if (name === "jobs") return [`${value}`, "Total Jobs"]
                  if (name === "completedJobs") return [`${value}`, "Completed Jobs"]
                  return [value, name]
                }}
              />
              <Area yAxisId="right" type="monotone" dataKey="earnings" stroke="#14b8a6" fill="#99f6e4" fillOpacity={0.35} />
              <Bar yAxisId="left" dataKey="jobs" fill="#6366f1" radius={[5, 5, 0, 0]} />
              <Bar yAxisId="left" dataKey="completedJobs" fill="#22c55e" radius={[5, 5, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
