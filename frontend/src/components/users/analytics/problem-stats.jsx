import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { AlertCircle } from "lucide-react"

const COLORS = ["#3b82f6", "#f97316", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"]

export function ProblemStats({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Your Common Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No service history yet</p>
            <p className="text-xs text-muted-foreground mt-1">Book a service to see insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Your Common Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="category" 
                width={90} 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value) => [`${value} times`, "Occurrences"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        {data.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm">
              <span className="font-medium">💡 Insight:</span>{" "}
              <span className="text-muted-foreground">
                "{data[0].category}" is your most common issue ({data[0].count} times). 
                Consider preventive maintenance!
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
