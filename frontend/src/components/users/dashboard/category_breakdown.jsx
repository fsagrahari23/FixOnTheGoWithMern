"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"

const categoryData = [
    { name: "Engine Service", value: 35 },
    { name: "Brake Service", value: 25 },
    { name: "Tire Service", value: 20 },
    { name: "Battery", value: 12 },
    { name: "Other", value: 8 },
]

const COLORS = ["#3b82f6", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"]

export function CategoryBreakdown() {
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
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
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
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px" }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
