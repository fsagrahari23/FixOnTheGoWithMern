import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Star } from "lucide-react"

const RATING_COLORS = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#84cc16",
  5: "#22c55e"
}

export function RatingsDistribution({ data = [] }) {
  const chartData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} star`,
    value: data.find((item) => item.rating === rating)?.count || 0,
    fill: RATING_COLORS[rating]
  }))

  const totalRatings = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          Ratings Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {totalRatings === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No ratings received yet</div>
        ) : (
          <>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
                  <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(value) => [`${value} reviews`, "Count"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`rating-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total reviews: <span className="font-semibold text-foreground">{totalRatings}</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
