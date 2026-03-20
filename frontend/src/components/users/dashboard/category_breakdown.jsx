"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"
import { apiGet } from "../../../lib/api"

const COLORS = ["#3b82f6", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"]

export function CategoryBreakdown() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const renderLegend = ({ payload }) => {
        if (!payload || payload.length === 0) return null

        return (
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                {payload.map((entry, index) => (
                    <div key={`${entry.value}-${index}`} className="flex items-center gap-2 min-w-0">
                        <span
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate max-w-48 sm:max-w-64">{entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await apiGet("/user/api/dashboard")
                const categories = res?.categories || {}
                const arr = Object.entries(categories).map(([name, value]) => ({ name, value }))
                if (mounted) setData(arr)
            } catch (e) {
                console.error("Category breakdown load failed", e)
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => (mounted = false)
    }, [])

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Category Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="80%"
                                paddingAngle={2}
                                dataKey="value"
                                isAnimationActive={!loading}
                            >
                                {(loading ? Array.from({ length: 5 }) : data).map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Legend verticalAlign="bottom" align="center" content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
