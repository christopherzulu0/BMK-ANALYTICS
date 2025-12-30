"use client"

import { useMemo } from "react"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Shipment = {
    id?: string
    date?: string | Date
    cargo_metric_tons?: number
    // other fields omitted
}

type VolumeChartsProps = {
    shipments?: Shipment[]
    className?: string
    title?: string
}

function monthShortName(idx: number, locale = "en-US") {
    // idx: 0-11
    const d = new Date(2000, idx, 1)
    return d.toLocaleString(locale, { month: "short" })
}

function toNumber(n: unknown): number {
    const v = Number(n)
    return Number.isFinite(v) ? v : 0
}

export default function VolumeCharts({
    shipments = [],
    className,
    title = "Transportation Analytics",
}: VolumeChartsProps) {
    // Current month/day/year
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Daily totals for current month (include zero days)
    const monthlyDailyData = useMemo(() => {
        // Initialize daily map with zeros
        const daily = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1, // 1..daysInMonth
            dateKey: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
            volume: 0,
        }))

        for (const s of shipments) {
            if (!s?.date || s?.cargo_metric_tons == null) continue
            const d = new Date(s.date)
            if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) continue
            const dayIdx = d.getDate() - 1
            if (dayIdx >= 0 && dayIdx < daily.length) {
                daily[dayIdx].volume += toNumber(s.cargo_metric_tons)
            }
        }
        return daily
    }, [shipments, currentYear, currentMonth, daysInMonth])

    // Monthly totals for current year (include zero months)
    const yearlyMonthlyData = useMemo(() => {
        const monthly = Array.from({ length: 12 }, (_, i) => ({
            monthIndex: i, // 0..11
            month: monthShortName(i),
            volume: 0,
        }))

        for (const s of shipments) {
            if (!s?.date || s?.cargo_metric_tons == null) continue
            const d = new Date(s.date)
            if (d.getFullYear() !== currentYear) continue
            const mi = d.getMonth()
            monthly[mi].volume += toNumber(s.cargo_metric_tons)
        }
        return monthly
    }, [shipments, currentYear])

    // Chart styling (avoid blue)
    const emerald = "#10b981" // Tailwind emerald-500
    const emeraldDark = "#059669" // emerald-600

    return (
        <section className={className}>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">{title}</h2>

            <Tabs defaultValue="monthly">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly View</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly">
                    <Card className="p-2 sm:p-4">
                        <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyDailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: "Day", position: "insideBottom", offset: -5, fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: "Volume (metric tons)", angle: -90, position: "insideLeft", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [value, "Volume (metric tons)"]}
                                        labelFormatter={(label: any) => `Day ${label}`}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="volume"
                                        name="Daily Volume"
                                        stroke={emeraldDark}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                            Showing daily totals for {monthShortName(currentMonth)} {currentYear}
                        </p>
                    </Card>
                </TabsContent>

                <TabsContent value="yearly">
                    <Card className="p-2 sm:p-4">
                        <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearlyMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: "Month", position: "insideBottom", offset: -5, fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: "Volume (metric tons)", angle: -90, position: "insideLeft", fontSize: 12 }}
                                    />
                                    <Tooltip formatter={(value: any) => [value, "Volume (metric tons)"]} />
                                    <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                                    <Bar yAxisId="left" dataKey="volume" name="Monthly Total" fill={emerald} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground text-center">Showing monthly totals for {currentYear}</p>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>
    )
}
