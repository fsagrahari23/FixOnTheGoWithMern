import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Eye, Calendar } from "lucide-react"
import { apiGet } from "../../../lib/api"
import { Link } from "react-router-dom"

const statusConfig = {
    pending: { label: "Pending", variant: "secondary" },
    "in-progress": { label: "In Progress", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
}

export function RecentBookings() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await apiGet("/user/api/dashboard")
                const list = Array.isArray(res?.bookings) ? res.bookings.slice(0, 5) : []
                if (mounted) setRows(list)
            } catch (e) {
                console.error("Recent bookings load failed", e)
                if (mounted) setRows([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        return () => (mounted = false)
    }, [])

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Recent Bookings
                    </CardTitle>
                    <Link to="/user/history">
                        <Button variant="outline" size="sm">View All</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Problem</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Mechanic</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-border/30">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-36 bg-muted rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-muted rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : (
                                rows.map((booking) => (
                                    <tr key={booking._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-sm text-foreground">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-foreground">{booking.problemCategory || booking.problem || "-"}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {booking.mechanic ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                        {(booking.mechanic.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-foreground">{booking.mechanic.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Badge variant={statusConfig[booking.status]?.variant || "secondary"}>
                                                {statusConfig[booking.status]?.label || booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link to={`/user/booking/${booking._id}`}>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
