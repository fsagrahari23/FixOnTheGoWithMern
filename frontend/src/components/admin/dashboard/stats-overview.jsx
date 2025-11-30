import { Card, CardContent } from "../../ui/card"
import { Users, Wrench, Clock, CalendarCheck } from "lucide-react"

export function StatsOverview({ stats }) {
    const statsData = [
        { 
            label: "Total Users", 
            value: stats?.userCount || 0, 
            icon: Users, 
            color: "blue",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-600 dark:text-blue-400"
        },
        { 
            label: "Active Mechanics", 
            value: stats?.mechanicCount || 0, 
            icon: Wrench, 
            color: "green",
            bgColor: "bg-green-500/10",
            textColor: "text-green-600 dark:text-green-400"
        },
        { 
            label: "Pending Approvals", 
            value: stats?.pendingMechanicCount || 0, 
            icon: Clock, 
            color: "orange",
            bgColor: "bg-orange-500/10",
            textColor: "text-orange-600 dark:text-orange-400"
        },
        { 
            label: "Total Bookings", 
            value: stats?.bookingCount || 0, 
            icon: CalendarCheck, 
            color: "cyan",
            bgColor: "bg-cyan-500/10",
            textColor: "text-cyan-600 dark:text-cyan-400"
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={stat.label}
                        className="overflow-hidden border hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                <Icon className={`h-7 w-7 ${stat.textColor}`} />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
