"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"

const COLORS = ["#f97316", "#06b6d4", "#3b82f6", "#10b981", "#ef4444", "#f43f5e"]

export function BookingChart({ stats }) {
    const data = [
        { name: "Pending", value: stats?.pending || 0 },
        { name: "Accepted", value: stats?.accepted || 0 },
        { name: "In Progress", value: stats?.inProgress || 0 },
        { name: "Completed", value: stats?.completed || 0 },
        { name: "Cancelled", value: stats?.cancelled || 0 },
        { name: "Emergency", value: stats?.emergency || 0 },
    ].filter(item => item.value > 0) // Only show non-zero values

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Booking Statistics
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {data.length === 0 ? (
                    <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No booking data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
