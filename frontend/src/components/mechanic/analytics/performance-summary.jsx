import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Activity, CheckCircle, XCircle, Star, IndianRupee, Wrench } from "lucide-react"

export function PerformanceSummary({ data = {} }) {
  const {
    totalJobs = 0,
    completedJobs = 0,
    cancelledJobs = 0,
    completionRate = 0,
    avgRating = 0,
    totalRatings = 0,
    totalEarnings = 0
  } = data

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          Your Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-sm font-medium">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Wrench className="w-5 h-5" />
              <span className="text-sm font-medium">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold">{totalJobs}</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <p className="text-lg font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
            <Star className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
            <p className="text-lg font-bold">{avgRating}★</p>
            <p className="text-xs text-muted-foreground">{totalRatings} reviews</p>
          </div>

          <div className="p-3 rounded-lg bg-red-500/10 text-center">
            <XCircle className="w-5 h-5 mx-auto text-red-600 mb-1" />
            <p className="text-lg font-bold">{cancelledJobs}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Job Completion</span>
            <span className="font-medium">{completedJobs} of {totalJobs}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
