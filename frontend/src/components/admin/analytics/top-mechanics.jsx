import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Trophy, Star, Wrench } from "lucide-react"

export function TopMechanics({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Top Mechanics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No mechanic data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getMedalColor = (index) => {
    if (index === 0) return "text-yellow-500"
    if (index === 1) return "text-gray-400"
    if (index === 2) return "text-amber-600"
    return "text-muted-foreground"
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          Top Mechanics Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {data.map((mechanic, index) => (
            <div 
              key={mechanic.mechanicId || index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${getMedalColor(index)}`}>
                {index < 3 ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{mechanic.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    {mechanic.completedJobs}/{mechanic.totalJobs} jobs
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {mechanic.avgRating || "N/A"}
                  </span>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-right">
                <p className="font-bold text-green-600">${mechanic.earnings?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">{mechanic.completionRate}% completion</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
