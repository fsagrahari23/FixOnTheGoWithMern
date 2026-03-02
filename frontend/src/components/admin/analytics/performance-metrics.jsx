import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Activity, Clock, CheckCircle, XCircle, Star } from "lucide-react"

const RATING_COLORS = {
  1: "#ef4444",
  2: "#f97316", 
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e"
}

export function PerformanceMetrics({ data = {} }) {
  const {
    totalBookings = 0,
    completedBookings = 0,
    cancelledBookings = 0,
    completionRate = 0,
    cancellationRate = 0,
    avgRating = 0,
    totalRatings = 0,
    avgCompletionTimeHours = 0,
    ratingDistribution = []
  } = data

  const ratingData = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating}★`,
    count: ratingDistribution.find(r => r.rating === rating)?.count || 0,
    fill: RATING_COLORS[rating]
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Completion</span>
            </div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{completedBookings} of {totalBookings}</p>
          </div>

          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Cancellation</span>
            </div>
            <p className="text-2xl font-bold">{cancellationRate}%</p>
            <p className="text-xs text-muted-foreground">{cancelledBookings} cancelled</p>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold">{avgRating}★</p>
            <p className="text-xs text-muted-foreground">{totalRatings} reviews</p>
          </div>

          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Time</span>
            </div>
            <p className="text-2xl font-bold">{avgCompletionTimeHours}h</p>
            <p className="text-xs text-muted-foreground">to complete</p>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Rating Distribution</h4>
          {ratingData.every(r => r.count === 0) ? (
            <div className="text-center py-6">
              <Star className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No ratings yet</p>
            </div>
          ) : (
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} margin={{ left: 0, right: 0 }}>
                  <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(value) => [`${value} reviews`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
