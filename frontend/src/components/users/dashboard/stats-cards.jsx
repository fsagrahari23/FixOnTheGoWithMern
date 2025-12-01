import { useEffect, useState } from "react"
import { Card, CardContent } from "../../ui/card"
import { Calendar, Clock, Wrench, CheckCircle } from "lucide-react"
import { apiGet } from "../../../lib/api"

export function StatsCards() {
    const [data, setData] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true
        const fetchStats = async () => {
            try {
                setLoading(true)
                const res = await apiGet("/user/api/dashboard")
                if (isMounted && res?.stats) {
                    setData({
                        total: res.stats.total || 0,
                        pending: res.stats.pending || 0,
                        inProgress: res.stats.inProgress || 0,
                        completed: res.stats.completed || 0,
                    })
                }
            } catch (e) {
                console.error("User stats load failed", e)
                setError("Failed to load stats")
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
        return () => {
            isMounted = false
        }
    }, [])

    const items = [
        { label: "Total Bookings", value: data.total, icon: Calendar, tint: "blue" },
        { label: "Pending", value: data.pending, icon: Clock, tint: "orange" },
        { label: "In Progress", value: data.inProgress, icon: Wrench, tint: "cyan" },
        { label: "Completed", value: data.completed, icon: CheckCircle, tint: "green" },
    ]

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse">
                        <div className="h-4 bg-muted rounded w-24 mb-3" />
                        <div className="h-7 bg-muted rounded w-20" />
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={stat.label}
                        className="overflow-hidden border hover:shadow-lg hover:scale-[1.01] transition-all bg-card"
                    >
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-${stat.tint}-500/15 text-${stat.tint}-600 dark:text-${stat.tint}-400`}>
                                <Icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
