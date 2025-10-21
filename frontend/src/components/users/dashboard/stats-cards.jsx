import { Card, CardContent } from "../../ui/card"
import { Calendar, Clock, Wrench, CheckCircle } from "lucide-react"

const stats = [
    { label: "Total Bookings", value: "12", icon: Calendar, tint: "blue" },
    { label: "Pending", value: "3", icon: Clock, tint: "orange" },
    { label: "In Progress", value: "2", icon: Wrench, tint: "cyan" },
    { label: "Completed", value: "7", icon: CheckCircle, tint: "green" },
]

export function StatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={stat.label}
                        className="
              overflow-hidden 
              border 
              hover:shadow-lg 
              hover:scale-[1.015] 
              transition-all 
              bg-card
            "
                    >
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>

                            <div
                                className={`
                  p-3 rounded-xl 
                  bg-${stat.tint}-500/15 
                  text-${stat.tint}-600 
                  dark:text-${stat.tint}-400
                `}
                            >
                                <Icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
