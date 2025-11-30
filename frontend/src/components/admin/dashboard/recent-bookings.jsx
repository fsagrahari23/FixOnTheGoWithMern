import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Eye, Calendar, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const statusConfig = {
    pending: { label: "Pending", variant: "secondary", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" },
    accepted: { label: "Accepted", variant: "default", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    "in-progress": { label: "In Progress", variant: "default", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" },
    completed: { label: "Completed", variant: "outline", color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
    cancelled: { label: "Cancelled", variant: "destructive", color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
    emergency: { label: "Emergency", variant: "destructive", color: "bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30" },
}

export function RecentBookings({ bookings = [] }) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Recent Bookings
                    </CardTitle>
                    <Link to="/admin/bookings">
                        <Button variant="ghost" size="sm" className="group">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <h5 className="text-lg font-semibold text-muted-foreground mb-2">No bookings found</h5>
                        <p className="text-sm text-muted-foreground">There are no bookings in the system yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                        <table className="w-full min-w-[640px]">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="pb-3 pr-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="pb-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                                    <th className="pb-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mechanic</th>
                                    <th className="pb-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Problem</th>
                                    <th className="pb-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="pb-3 pl-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-4 pr-3 text-sm whitespace-nowrap">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-3">
                                            {booking.user ? (
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {booking.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium truncate">{booking.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-3">
                                            {booking.mechanic ? (
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {booking.mechanic.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium truncate">{booking.mechanic.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className="text-sm truncate block max-w-[150px]" title={booking.problemCategory}>
                                                {booking.problemCategory}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3">
                                            <Badge 
                                                variant="outline" 
                                                className={statusConfig[booking.status?.toLowerCase()]?.color || ""}
                                            >
                                                {statusConfig[booking.status?.toLowerCase()]?.label || booking.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 pl-3">
                                            <Link to={`/admin/booking/${booking._id}`}>
                                                <Button size="sm" variant="outline" className="whitespace-nowrap">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
