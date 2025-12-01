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
            <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
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
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px" }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
