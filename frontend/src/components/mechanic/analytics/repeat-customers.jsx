import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Users, Calendar, IndianRupee } from "lucide-react"

export function RepeatCustomers({ data = [] }) {
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
            <p className="text-xs text-muted-foreground mt-1">Keep providing great service!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    })
  }

  const totalFromRepeats = data.reduce((sum, c) => sum + (c.totalSpent || 0), 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-border/50 px-4 sm:px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          Repeat Customers ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {data.map((customer, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{customer.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{customer.visits} visits</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(customer.lastVisit)}
                  </span>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <p className="font-bold text-green-600 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {customer.totalSpent?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Revenue from repeat customers</span>
            <span className="font-bold text-green-600">${totalFromRepeats.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
