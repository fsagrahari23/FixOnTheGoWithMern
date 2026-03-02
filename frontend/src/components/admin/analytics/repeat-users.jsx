import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Users, Crown, Calendar } from "lucide-react"

export function RepeatUsers({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Repeat Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No repeat customers yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          Repeat Customers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {data.map((user, index) => (
            <div 
              key={user.userId || index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.name}</p>
                  {user.isPremium && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{user.bookingCount} bookings</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last: {formatDate(user.lastBooking)}
                  </span>
                </div>
              </div>

              {/* Total Spent */}
              <div className="text-right">
                <p className="font-bold text-green-600">${user.totalSpent?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">lifetime value</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total repeat customers</span>
            <span className="font-bold">{data.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Total revenue from repeats</span>
            <span className="font-bold text-green-600">
              ${data.reduce((sum, u) => sum + (u.totalSpent || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
