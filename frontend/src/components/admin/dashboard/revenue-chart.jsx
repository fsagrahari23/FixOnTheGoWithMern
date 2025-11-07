"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

export function RevenueChart({ monthlyStats = [] }) {
    // Helper: Get last 6 months labels
    const getLastNMonthsLabels = (n = 6) => {
        const labels = []
        const now = new Date()
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            labels.push(`${y}-${m}`)
        }
        return labels
    }

    // Helper: Map revenue series to chart data
    const mapRevenueData = (stats, labels) => {
        const map = new Map()
        stats.forEach(item => {
            if (item && item.month) {
                map.set(item.month, {
                    booking: Number(item.booking || 0),
                    subscription: Number(item.subscription || 0)
                })
            }
        })

        return labels.map(month => {
            const v = map.get(month) || { booking: 0, subscription: 0 }
            return {
                month: month.substring(5), // Get MM part only
                booking: v.booking,
                subscription: v.subscription,
                total: v.booking + v.subscription
            }
        })
    }

    const baseLabels = getLastNMonthsLabels(6)
    const data = mapRevenueData(monthlyStats, baseLabels)

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {data.every(d => d.total === 0) ? (
                    <div className="text-center py-12">
                        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No revenue data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis 
                                dataKey="month" 
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis 
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                                formatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                            <Line 
                                type="monotone" 
                                dataKey="booking" 
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                name="Booking Revenue"
                                dot={{ fill: '#06b6d4' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="subscription" 
                                stroke="#f15bb5" 
                                strokeWidth={2}
                                name="Subscription Revenue"
                                dot={{ fill: '#f15bb5' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
