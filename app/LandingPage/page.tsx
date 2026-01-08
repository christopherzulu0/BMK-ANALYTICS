"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, CheckCircle, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import HeroSection from "./components/HeroSection"
import OurValues from "./components/OurValues"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import InteractiveMap from "./components/InterativeMap"
import Navbar from "./NavBar/Navbar"

// NOTE: If you see module not found errors for 'framer-motion', 'recharts', 'lucide-react', or '@tanstack/react-query', install them with npm or yarn.
// npm install framer-motion recharts lucide-react @tanstack/react-query

// Empty data instead of mock data
const pipelineStats = {
    length: 0,
    capacity: 0,
    currentUtilization: 0,
    activeClients: 0,
}

// Compute monthly and yearly analytics from shipments
const faqItems: any[] = []
const pipelineStatus: any[] = []
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const pipelineMarkers: any[] = []

export default function Home() {
    const [activeTab, setActiveTab] = useState("monthly")
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
    const [isVisible, setIsVisible] = useState(false)
    const [currentUtilization, setCurrentUtilization] = useState(pipelineStats.currentUtilization)
    const [notifications, setNotifications] = useState(true)
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "ascending" | "descending" }>({
        key: null,
        direction: "ascending",
    })

    // Fetch shipments from your API
    const {
        data: shipmentsData,
        isLoading: isShipmentsLoading,
        isError: isShipmentsError,
    } = useQuery({
        queryKey: ["shipments"],
        queryFn: async () => {
            const res = await axios.get("/api/shipments")
            return res.data?.shipments ?? []
        },
        staleTime: 1000 * 60 * 5,
    })

    const [transportations, setTransportations] = useState<any[]>([])

    // Update transportations when shipmentsData changes
    useEffect(() => {
        if (shipmentsData) {
            setTransportations(shipmentsData)
        }
    }, [shipmentsData])

    const [notificationMessage, setNotificationMessage] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 5000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentUtilization((prev) => {
                const newValue = prev + (Math.random() > 0.5 ? 1 : -1)
                return Math.min(Math.max(newValue, 0), 100)
            })
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleNotificationToggle = (checked: boolean) => {
        setNotifications(checked)
        setNotificationMessage(
            checked
                ? "Notifications enabled. You will receive real-time pipeline updates."
                : "Notifications disabled. You will no longer receive pipeline updates.",
        )
        setTimeout(() => setNotificationMessage(""), 3000)
    }

    const sortTransportations = useCallback(
        (key: string) => {
            let direction: "ascending" | "descending" = "ascending"
            if (sortConfig.key === key && sortConfig.direction === "ascending") {
                direction = "descending"
            }
            setSortConfig({ key, direction })
            setTransportations((prev) =>
                [...prev].sort((a, b) => {
                    if (a[key] < b[key]) return direction === "ascending" ? -1 : 1
                    if (a[key] > b[key]) return direction === "ascending" ? 1 : -1
                    return 0
                }),
            )
        },
        [sortConfig],
    )

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = transportations.slice(indexOfFirstItem, indexOfLastItem)
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    // Helper: safe number
    const toNumber = (n: unknown) => {
        const v = Number(n)
        return Number.isFinite(v) ? v : 0
    }

    // NEW: Daily totals for current month (include zero-volume days)
    const dailyVolumeCurrentMonth = useMemo(() => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() // 0-11
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const daily = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1, // 1..daysInMonth
            volume: 0,
        }))

        if (Array.isArray(shipmentsData)) {
            for (const s of shipmentsData) {
                if (!s?.date || s?.cargo_metric_tons == null) continue
                const d = new Date(s.date)
                if (d.getFullYear() !== year || d.getMonth() !== month) continue
                const idx = d.getDate() - 1
                if (idx >= 0 && idx < daily.length) {
                    daily[idx].volume += toNumber(s.cargo_metric_tons)
                }
            }
        }
        return daily
    }, [shipmentsData])

    // NEW: Monthly totals for current year (include zero-volume months)
    const monthlyVolumeCurrentYear = useMemo(() => {
        const now = new Date()
        const year = now.getFullYear()
        const months = Array.from({ length: 12 }, (_, i) => ({
            monthIdx: i,
            month: new Date(2000, i, 1).toLocaleString("en-US", { month: "short" }),
            volume: 0,
        }))

        if (Array.isArray(shipmentsData)) {
            for (const s of shipmentsData) {
                if (!s?.date || s?.cargo_metric_tons == null) continue
                const d = new Date(s.date)
                if (d.getFullYear() !== year) continue
                const mi = d.getMonth()
                months[mi].volume += toNumber(s.cargo_metric_tons)
            }
        }
        return months
    }, [shipmentsData])

    return (
        <div className="min-h-screen w-full">
          

            {/* Hero Section */}
            <motion.section style={{ opacity, scale }}>
                <HeroSection />
            </motion.section>

            <main className="container py-8">
                {/* Notification */}
                {notificationMessage && (
                    <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50">
                        {notificationMessage}
                    </div>
                )}

                {/* Real-time Pipeline Status */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Real-time Pipeline Status</span>
                                <div className="flex items-center space-x-2">
                                    <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationToggle} />
                                    <Label htmlFor="notifications">Notifications</Label>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold">Current Utilization:</span>
                                <span className="text-2xl font-bold">{currentUtilization.toFixed(2)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${currentUtilization}%` }}></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {currentUtilization > 90 ? (
                                    <div className="flex items-center justify-center space-x-2 text-red-500">
                                        <AlertTriangle />
                                        <span>High Utilization</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2 text-green-500">
                                        <CheckCircle />
                                        <span>Normal Operation</span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold">Next Maintenance:</span>
                                    <br />
                                    <span>In 7 days</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Estimated Downtime:</span>
                                    <br />
                                    <span>4 hours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Pipeline Stats */}
                <motion.section
                    id="stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Pipeline Performance</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {Object.entries(pipelineStats).map(([key, value], index) => (
                            <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Card className="text-center h-full">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base sm:text-lg md:text-xl">
                                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.p
                                            className="text-2xl sm:text-3xl md:text-4xl font-bold"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 + index * 0.2 }}
                                        >
                                            {typeof value === "number" && value > 1000 ? value.toLocaleString() : value}
                                            {key === "length"
                                                ? " km"
                                                : key === "capacity"
                                                    ? " barrels"
                                                    : key === "currentUtilization"
                                                        ? "%"
                                                        : ""}
                                        </motion.p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Recent Transportations */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Recent Transportations</h2>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => sortTransportations("date")} className="cursor-pointer">
                                        Date <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                    </TableHead>
                                    <TableHead onClick={() => sortTransportations("company")} className="cursor-pointer">
                                        Company <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                    </TableHead>
                                    <TableHead onClick={() => sortTransportations("volume")} className="cursor-pointer">
                                        Volume (barrels) <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                    </TableHead>
                                    <TableHead onClick={() => sortTransportations("destination")} className="cursor-pointer">
                                        Destination <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                    </TableHead>
                                    <TableHead onClick={() => sortTransportations("status")} className="cursor-pointer">
                                        Status <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isShipmentsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : isShipmentsError ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-red-500">
                                            Failed to load shipments
                                        </TableCell>
                                    </TableRow>
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No shipments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((transport: any, index: number) => (
                                        <motion.tr
                                            key={transport.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                        >
                                            <TableCell>{transport.date ? new Date(transport.date).toLocaleDateString() : ""}</TableCell>
                                            <TableCell>{transport.supplier || ""}</TableCell>
                                            <TableCell>
                                                {transport.cargo_metric_tons ? transport.cargo_metric_tons.toLocaleString() : ""}
                                            </TableCell>
                                            {/* If destination is not available in your shipment model, leave blank or add logic here */}
                                            <TableCell>{transport.destination || ""}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${transport.status === "Completed"
                                                            ? "bg-green-200 text-green-800"
                                                            : transport.status === "In Transit"
                                                                ? "bg-blue-200 text-blue-800"
                                                                : "bg-yellow-200 text-yellow-800"
                                                        }`}
                                                >
                                                    {transport.status}
                                                </span>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="flex items-center justify-between px-2 py-4">
                            <Button
                                className="border px-2 py-1 text-sm flex items-center"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span>
                                Page {currentPage} of {Math.ceil(transportations.length / itemsPerPage)}
                            </span>
                            <Button
                                className="border px-2 py-1 text-sm flex items-center"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(transportations.length / itemsPerPage)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </motion.section>

                {/* Volume Charts */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Transportation Analytics</h2>

                    <div suppressHydrationWarning>
                        <Tabs defaultValue="monthly" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly View</TabsTrigger>
                            {/*<TabsTrigger value="distribution">Distribution</TabsTrigger>*/}
                        </TabsList>

                        {/* Monthly: Daily totals for current month */}
                        <TabsContent value="monthly">
                            <Card className="p-2 sm:p-4 ">
                                <ChartContainer
                                    config={{
                                        volume: { label: "Volume (metric tons)", color: "hsl(var(--chart-2))" },
                                    }}
                                    className="h-[400px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailyVolumeCurrentMonth}>
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
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="volume"
                                                name="Daily Volume"
                                                stroke="var(--color-volume)"
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                <p className="mt-2 text-xs text-muted-foreground text-center">
                                    Showing daily totals for the current month (including zero-volume days)
                                </p>
                            </Card>
                        </TabsContent>

                        {/* Yearly: Monthly totals for current year */}
                        <TabsContent value="yearly">
                            <Card className="p-2 sm:p-4">
                                <ChartContainer
                                    config={{
                                        volume: { label: "Volume (metric tons)", color: "hsl(var(--chart-4))" },
                                    }}
                                    className="h-[400px] w-full "
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyVolumeCurrentYear}>
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
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="volume"
                                                name="Monthly Total"
                                                fill="var(--color-volume)"
                                                
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                <p className="mt-2 text-xs text-muted-foreground text-center">
                                    Showing monthly totals for the current year (including months with zero volume)
                                </p>
                            </Card>
                        </TabsContent>

                    </Tabs>
                    </div>
                </motion.section>

                {/* Services Overview */}
                <motion.section
                    id="services"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mb-12"
                >
                    <OurValues />
                </motion.section>

                {/* Interactive Pipeline Map */}
                <InteractiveMap/>
            </main>
        </div>
    )
}
