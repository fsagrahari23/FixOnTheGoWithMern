import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Eye, Calendar } from "lucide-react"

const bookings = [
    {
        id: "1",
        date: "2025-10-15",
        problem: "Engine Oil Change",
        mechanic: { name: "John Smith", initial: "J" },
        status: "completed",
    },
    {
        id: "2",
        date: "2025-10-18",
        problem: "Brake Inspection",
        mechanic: { name: "Sarah Johnson", initial: "S" },
        status: "in-progress",
    },
    {
        id: "3",
        date: "2025-10-20",
        problem: "Tire Rotation",
        mechanic: null,
        status: "pending",
    },
    {
        id: "4",
        date: "2025-10-12",
        problem: "Battery Replacement",
        mechanic: { name: "Mike Davis", initial: "M" },
        status: "completed",
    },
    {
        id: "5",
        date: "2025-10-19",
        problem: "Air Filter Replacement",
        mechanic: { name: "Emma Wilson", initial: "E" },
        status: "pending",
    },
]

const statusConfig = {
    pending: { label: "Pending", variant: "secondary" },
    "in-progress": { label: "In Progress", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
}

export function RecentBookings() {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Recent Bookings
                    </CardTitle>
                    <Button variant="outline" size="sm">
                        View All
                    </Button>
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
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 text-sm text-foreground">{new Date(booking.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">{booking.problem}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {booking.mechanic ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                    {booking.mechanic.initial}
                                                </div>
                                                <span className="text-foreground">{booking.mechanic.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <Badge variant={statusConfig[booking.status].variant}>
                                            {statusConfig[booking.status].label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
