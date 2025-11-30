import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CreditCard } from "lucide-react"

const COLORS = {
    "Pending": "#f97316",
    "Completed": "#06b6d4"
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
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1.5 px-1">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div 
                        className="w-2.5 h-2.5 rounded-sm shrink-0" 
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                        {entry.value} <span className="font-semibold text-foreground">({entry.payload.value})</span>
                    </span>
                </div>
            ))}
        </div>
    )
}

export function PaymentChart({ stats }) {
    // Sample raw data - replace these values with your API data
    const rawData = [
        { name: "Pending", value: stats?.pending || 15 },
        { name: "Completed", value: stats?.completed || 35 },
    ].filter(item => item.value > 0)

    const total = rawData.reduce((sum, item) => sum + item.value, 0)
    
    const data = rawData.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
        fill: COLORS[item.name]
    }))

    return (
        <Card className="border-0 shadow-lg h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-3 pt-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    Payment Statistics
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col justify-center items-center">
                {data.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 md:py-12">
                        <CreditCard className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No payment data available</p>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center mx-auto md:-mt-8">
                        <div className="w-full flex justify-center">
                            <ResponsiveContainer width="100%" height={200} className="sm:hidden">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
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
                            <ResponsiveContainer width="100%" height={180} className="hidden sm:block">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
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
                        <div className="mt-2 sm:mt-3 w-full flex justify-center">
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

export default PaymentChart