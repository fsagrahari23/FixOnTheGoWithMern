"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"

const COLORS = {
    "Pending": "#f8961e",
    "Accepted": "#4cc9f0",
    "In Progress": "#4361ee",
    "Completed": "#38b000",
    "Cancelled": "#ef476f",
    "Emergency": "#ff6b6b"
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0]
        return (
            <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2">
                <p className="font-semibold text-sm mb-1" style={{ color: data.payload.fill }}>
                    {data.name}
                </p>
                <p className="text-xs text-muted-foreground">
                    Count: <span className="font-medium text-foreground">{data.value}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    Share: <span className="font-medium text-foreground">{data.payload.percentage}%</span>
                </p>
            </div>
        )
    }
    return null
}

const CustomLegend = ({ payload }) => {
    return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5 px-1">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div 
                        className="w-2.5 h-2.5 rounded-sm shrink-0" 
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                        {entry.value} <span className="font-semibold text-foreground">({entry.payload.value})</span>
                    </span>
                </div>
            ))}
        </div>
    )
}

export function BookingChart({ stats }) {
    // Sample raw data - replace these values with your API data
    const rawData = [
        { name: "Pending", value: stats?.pending || 8 },
        { name: "Accepted", value: stats?.accepted || 15 },
        { name: "In Progress", value: stats?.inProgress || 12 },
        { name: "Completed", value: stats?.completed || 45 },
        { name: "Cancelled", value: stats?.cancelled || 5 },
        { name: "Emergency", value: stats?.emergency || 3 },
    ].filter(item => item.value > 0)

    const total = rawData.reduce((sum, item) => sum + item.value, 0)
    
    const data = rawData.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
        fill: COLORS[item.name]
    }))

    return (
        <Card className="border-0 shadow-lg h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-2.5 pt-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Booking Statistics
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-center items-center">
                {data.length === 0 ? (
                    <div className="text-center py-3">
                        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No booking data available</p>
                    </div>
                ) : (
                    <div className="w-full max-w-sm flex flex-col items-center mx-auto">
                        <div className="w-full flex justify-center">
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.fill}
                                                className="transition-opacity hover:opacity-80"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-0.5 w-full flex justify-center">
                            <CustomLegend payload={data.map(item => ({ 
                                value: item.name, 
                                color: item.fill,
                                payload: item
                            }))} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default BookingChart