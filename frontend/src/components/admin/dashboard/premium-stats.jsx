import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Crown, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function PremiumStats({ stats }) {
    const premiumData = {
        total: stats?.premiumUserCount || 0,
        monthly: stats?.subscriptionStats?.monthly || 0,
        yearly: stats?.subscriptionStats?.yearly || 0,
        revenue: stats?.paymentStats?.subscriptionRevenue || 0
    }

    return (
        <Card className="border-0 shadow-lg h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-2.5 pt-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-yellow-500/10">
                        <Crown className="w-4 h-4 text-yellow-600" />
                    </div>
                    Premium Users
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col">
                <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-primary mb-1">{premiumData.total}</p>
                    <p className="text-sm text-muted-foreground">Active Premium Members</p>
                </div>
                
                <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Monthly Plans</span>
                        <span className="font-bold text-base">{premiumData.monthly}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Yearly Plans</span>
                        <span className="font-bold text-base">{premiumData.yearly}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Revenue</span>
                        <span className="font-bold text-base text-green-600 dark:text-green-400">
                            ${premiumData.revenue.toFixed(2)}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 p-2.5">
                <Link to="/admin/subscriptions" className="w-full">
                    <Button variant="outline" className="w-full group text-sm h-9">
                        Manage Subscriptions
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
