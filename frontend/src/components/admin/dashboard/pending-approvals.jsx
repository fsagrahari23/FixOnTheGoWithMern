import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Clock, AlertTriangle, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function PendingApprovals({ count }) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Mechanic Approvals
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {count === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <h5 className="text-md font-semibold text-muted-foreground mb-2">
                            No pending approvals
                        </h5>
                        <p className="text-sm text-muted-foreground">
                            All mechanic registrations are processed.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-yellow-900 dark:text-yellow-200 block mb-1">
                                        Attention Required!
                                    </strong>
                                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                                        You have <span className="font-semibold">{count}</span> mechanic registration(s) pending approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link to="/admin/mechanics" className="w-full block">
                            <Button className="w-full group">
                                Review Approvals
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
