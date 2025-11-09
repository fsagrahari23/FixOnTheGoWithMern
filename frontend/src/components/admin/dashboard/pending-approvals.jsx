import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Clock, AlertTriangle, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../../../lib/utils"

export function PendingApprovals({ count, className }) {
    return (
        <Card className={cn("border-0 shadow-lg h-full flex flex-col", className)}>
            <CardHeader className="border-b border-border/50 pb-2.5 pt-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Pending Mechanic Approvals
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-center">
                {count === 0 ? (
                    <div className="text-center py-3 flex-1 flex flex-col justify-center">
                        <Clock className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                        <h5 className="text-sm font-semibold text-muted-foreground mb-1">
                            No pending approvals
                        </h5>
                        <p className="text-xs text-muted-foreground">
                            All mechanic registrations are processed.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center h-full gap-8">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-1" />
                                <div>
                                    <strong className="text-yellow-900 dark:text-yellow-200 block mb-0.5 text-xl">
                                        Attention Required!
                                    </strong>
                                    <p className="text-yellow-800 dark:text-yellow-300 text-md leading-relaxed">
                                        You have <span className="font-bold">{count}</span> mechanic registration(s) pending approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link to="/admin/mechanics" className="w-full block">
                            <Button className="w-full group text-sm h-9">
                                Review Approvals
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
