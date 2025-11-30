import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { DollarSign, CreditCard, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function PaymentOverview({ stats }) {
    const paymentData = {
        totalRevenue: stats?.totalRevenue || 0,
        completed: stats?.completed || 0,
        pending: stats?.pending || 0
    }

    const total = paymentData.completed + paymentData.pending
    const progressPercentage = total > 0 ? (paymentData.completed / total * 100).toFixed(2) : 0

    return (
        <Card className="border-0 shadow-lg h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-2.5 pt-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5" />
                    Payment Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col">
                <div className="flex flex-col gap-2.5 mb-3">
                    <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between">
                            <h6 className="text-sm text-muted-foreground font-medium">Total Revenue</h6>
                            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                                ${paymentData.totalRevenue.toFixed(2)}
                            </h3>
                        </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <h6 className="text-sm text-muted-foreground font-medium">Completed</h6>
                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {paymentData.completed}
                            </h3>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-semibold">
                            {paymentData.completed} / {total}
                        </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-1">
                        <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right font-medium">
                        {progressPercentage}% Complete
                    </div>
                </div>

                <Link to="/admin/payments" className="w-full block">
                    <Button variant="outline" className="w-full group text-sm h-9">
                        <CreditCard className="w-4 h-4 mr-2" />
                        View Payment Details
                        <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
