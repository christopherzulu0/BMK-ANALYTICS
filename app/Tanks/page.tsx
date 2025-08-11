"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    Pencil,
    Trash2,
    RefreshCw,
    Info,
    ClipboardList,
    Save,
    Copy,
    Settings,
    Filter,
    ChevronDown,
    Upload,
    Download,
    Plus,
    BarChart3,
    Menu,
    Droplet,
    Factory,
    Thermometer,
    Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart" // shadcn/ui charts [^2]

type TankStatus = "Active" | "Rehabilitation"

type Tank = {
    id: string
    name: string // e.g., T1
    status: TankStatus
    levelMm?: number
    volumeM3?: number
    waterCm?: number | null
    sg?: number | null
    tempC?: number | null
    volAt20C?: number | null
    mts?: number | null
}

type DischargeSummary = {
    tfarmDischargeM3: number
    kigamboniDischargeM3: number
    netDeliveryM3At20C: number
    netDeliveryMT: number
    pumpOverDate: string
    prevVolumeM3: number
    opUllageVolM3: number
}

type EntryData = {
    tanks: Tank[]
    summary: DischargeSummary
    remarks: string[]
}

type Station = { id: string; name: string }

const LS_KEY_DATA = "tankfarm-entries-v3"
const LS_KEY_STATIONS = "tankfarm-stations-v3"

const defaultStations: Station[] = [
    { id: "s1", name: "Tankfarm" },
    { id: "s2", name: "Kigamboni" },
    { id: "s3", name: "NFT" },
]

const initialTanks: Tank[] = [
    {
        id: "t1",
        name: "T1",
        status: "Active",
        levelMm: 15006,
        volumeM3: 35041,
        waterCm: 4.5,
        sg: 0.822,
        tempC: 33.0,
        volAt20C: 34594.825,
        mts: 28675.651,
    },
    {
        id: "t2",
        name: "T2",
        status: "Active",
        levelMm: 1650,
        volumeM3: 3619,
        waterCm: 5.0,
        sg: 0.834,
        tempC: 24.5,
        volAt20C: 3580.881,
        mts: 3009.73,
    },
    {
        id: "t3",
        name: "T3",
        status: "Active",
        levelMm: 1619,
        volumeM3: 3507,
        waterCm: 9.0,
        sg: 0.83,
        tempC: 30.0,
        volAt20C: 3419.959,
        mts: 2866.952,
    },
    {
        id: "t4",
        name: "T4",
        status: "Active",
        levelMm: 9077,
        volumeM3: 21116,
        waterCm: 0.2,
        sg: 0.829,
        tempC: 27.5,
        volAt20C: 20979.703,
        mts: 17543.228,
    },
    {
        id: "t5",
        name: "T5",
        status: "Rehabilitation",
    },
    {
        id: "t6",
        name: "T6",
        status: "Active",
        levelMm: 1023,
        volumeM3: 2814,
        waterCm: null, // NIL
        sg: 0.82,
        tempC: 28.5,
        volAt20C: 2793.406,
        mts: 2300.37,
    },
]

const initialSummary: DischargeSummary = {
    tfarmDischargeM3: 3942,
    kigamboniDischargeM3: 3879,
    netDeliveryM3At20C: 3912.567,
    netDeliveryMT: 3221.999,
    pumpOverDate: "2025-08-05",
    prevVolumeM3: 70039,
    opUllageVolM3: 122730,
}

const defaultRemarks = [
    "T6 on delivery to NFT by MP3",
    "Stock Inventory done together with ITS Surveyor",
    "Discharge from Tankfarm based on tank on delivery",
    "Pumping days = 13 days",
]

function formatNumber(value: number | null | undefined, opts: Intl.NumberFormatOptions = {}) {
    if (value === null || value === undefined || Number.isNaN(value)) return "-"
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3, ...opts }).format(value)
}

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

type DataMap = Record<string, Record<string, EntryData>> // stationId -> date(YYYY-MM-DD) -> EntryData
type SortKey = "name" | "volumeM3" | "volAt20C" | "mts"

export default function Page() {
    const { toast } = useToast()

    // Stations
    const [stations, setStations] = useState<Station[]>(defaultStations)
    const [stationId, setStationId] = useState<string>(defaultStations[0].id)

    // Date selection (default to today)
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))

    // All entries map
    const [dataMap, setDataMap] = useState<DataMap>({})

    // Working copy for the current station+date
    const [tanks, setTanks] = useState<Tank[]>(initialTanks)
    const [summary, setSummary] = useState<DischargeSummary>(initialSummary)
    const [remarks, setRemarks] = useState<string[]>(defaultRemarks)

    // UI state
    const [openForm, setOpenForm] = useState(false)
    const [editing, setEditing] = useState<Tank | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<Tank | null>(null)
    const [showRefs, setShowRefs] = useState(false)
    const [manageStationsOpen, setManageStationsOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)

    // Filters/sorting
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<TankStatus | "All">("All")
    const [sortKey, setSortKey] = useState<SortKey>("name")
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

    // CSV import
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load persisted stations and entries
    useEffect(() => {
        try {
            const stationRaw = localStorage.getItem(LS_KEY_STATIONS)
            if (stationRaw) {
                const parsed = JSON.parse(stationRaw)
                if (Array.isArray(parsed) && parsed.length) {
                    setStations(parsed)
                    setStationId(parsed[0].id)
                }
            }
            const dataRaw = localStorage.getItem(LS_KEY_DATA)
            if (dataRaw) {
                const parsed = JSON.parse(dataRaw) as DataMap
                setDataMap(parsed || {})
            }
        } catch (e) {
            console.warn("Failed to parse saved data", e)
        }
    }, [])

    // Persist stations and entries
    useEffect(() => {
        localStorage.setItem(LS_KEY_STATIONS, JSON.stringify(stations))
    }, [stations])

    useEffect(() => {
        localStorage.setItem(LS_KEY_DATA, JSON.stringify(dataMap))
    }, [dataMap])

    // Whenever station/date changes, load working data or default
    useEffect(() => {
        const stationEntries = dataMap[stationId] || {}
        const entry = stationEntries[date]
        if (entry) {
            setTanks(entry.tanks)
            setSummary(entry.summary)
            setRemarks(entry.remarks)
        } else {
            setTanks(initialTanks)
            setSummary(initialSummary)
            setRemarks(defaultRemarks)
        }
    }, [stationId, date, dataMap])

    // Keyboard shortcuts
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault()
                saveCurrent()
            } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "n") {
                e.preventDefault()
                onAddNew()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [tanks, summary, remarks, stationId, date])

    const totals = useMemo(() => calcTotals(tanks), [tanks])

    // Actions
    function onAddNew() {
        setEditing(null)
        setOpenForm(true)
    }
    function onEdit(t: Tank) {
        setEditing(t)
        setOpenForm(true)
    }
    function onDelete(t: Tank) {
        setConfirmDelete(t)
    }
    function doDelete() {
        if (confirmDelete) {
            setTanks((prev) => prev.filter((x) => x.id !== confirmDelete.id))
            setConfirmDelete(null)
        }
    }

    function resetSample() {
        setTanks(initialTanks)
        setSummary(initialSummary)
        setRemarks(defaultRemarks)
        toast({ title: "Sample data restored" })
    }

    function saveCurrent() {
        setDataMap((prev) => {
            const stationEntries = { ...(prev[stationId] || {}) }
            stationEntries[date] = { tanks, summary, remarks }
            return { ...prev, [stationId]: stationEntries }
        })
        toast({ title: "Saved", description: `${currentStationName(stations, stationId)} - ${date}` })
    }

    function copyFromPrevious() {
        const entries = Object.entries(dataMap[stationId] || {})
            .filter(([d]) => d < date)
            .sort((a, b) => (a[0] > b[0] ? -1 : 1))
        if (entries.length) {
            const prevData = entries[0][1]
            setTanks(prevData.tanks.map((t) => ({ ...t, id: uid() })))
            setSummary({ ...prevData.summary })
            setRemarks([...prevData.remarks])
            toast({ title: "Copied from previous day", description: entries[0][0] })
        } else {
            toast({ title: "No previous day found", variant: "destructive" as any })
        }
    }

    function exportCSV() {
        const header = ["name", "status", "levelMm", "volumeM3", "waterCm", "sg", "tempC", "volAt20C", "mts"].join(",")
        const rows = tanks.map((t) =>
            [
                safe(t.name),
                safe(t.status),
                numOrEmpty(t.levelMm),
                numOrEmpty(t.volumeM3),
                t.waterCm === null ? "NIL" : numOrEmpty(t.waterCm ?? undefined),
                numOrEmpty(t.sg),
                numOrEmpty(t.tempC),
                numOrEmpty(t.volAt20C),
                numOrEmpty(t.mts),
            ].join(","),
        )
        const text = [header, ...rows].join("\n")
        const blob = new Blob([text], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${currentStationName(stations, stationId)}-${date}-tanks.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    function importCSV(text: string) {
        const lines = text.split(/\r?\n/).filter(Boolean)
        if (lines.length <= 1) return
        const header = lines[0].split(",").map((s) => s.trim().toLowerCase())

        const idx = {
            name: findIdx(header, ["name"]),
            status: findIdx(header, ["status"]),
            levelMm: findIdx(header, ["levelmm", "level_mm"]),
            volumeM3: findIdx(header, ["volumem3", "volume m3", "volume"]),
            waterCm: findIdx(header, ["watercm", "water cm"]),
            sg: findIdx(header, ["sg"]),
            tempC: findIdx(header, ["tempc", "temp c"]),
            volAt20C: findIdx(header, ["volm3 @ 20c", "volm3@20c", "volat20c", "vol m3 @ 20c"]),
            mts: findIdx(header, ["mts"]),
        }

        const parsed: Tank[] = lines.slice(1).map((ln) => {
            const cells = splitCsv(ln)
            const status = (cells[idx.status] || "Active") as TankStatus
            const waterRaw = cells[idx.waterCm]
            const waterVal = waterRaw?.toUpperCase?.() === "NIL" ? null : toNumMaybe(waterRaw)
            return {
                id: uid(),
                name: (cells[idx.name] || "").toUpperCase(),
                status: status === "Rehabilitation" ? "Rehabilitation" : "Active",
                levelMm: toNumMaybe(cells[idx.levelMm]) ?? undefined,
                volumeM3: toNumMaybe(cells[idx.volumeM3]) ?? undefined,
                waterCm: waterVal,
                sg: toNumMaybe(cells[idx.sg]) ?? undefined,
                tempC: toNumMaybe(cells[idx.tempC]) ?? undefined,
                volAt20C: toNumMaybe(cells[idx.volAt20C]) ?? undefined,
                mts: toNumMaybe(cells[idx.mts]) ?? undefined,
            }
        })

        setTanks(parsed)
        toast({ title: "Imported CSV", description: `${parsed.length} tank rows` })
    }

    function onPickFile() {
        fileInputRef.current?.click()
    }

    const stationHistory = useMemo(() => {
        const entries = Object.entries(dataMap[stationId] || {}).sort((a, b) => (a[0] > b[0] ? -1 : 1))
        return entries
    }, [dataMap, stationId])

    const filteredSorted = useMemo(() => {
        let rows = tanks
        if (query.trim()) {
            const q = query.trim().toLowerCase()
            rows = rows.filter((t) => t.name.toLowerCase().includes(q))
        }
        if (statusFilter !== "All") {
            rows = rows.filter((t) => t.status === statusFilter)
        }
        rows = [...rows].sort((a: any, b: any) => {
            const A = a[sortKey] ?? (sortKey === "name" ? "" : Number.NEGATIVE_INFINITY)
            const B = b[sortKey] ?? (sortKey === "name" ? "" : Number.NEGATIVE_INFINITY)
            if (A < B) return sortDir === "asc" ? -1 : 1
            if (A > B) return sortDir === "asc" ? 1 : -1
            return 0
        })
        return rows
    }, [tanks, query, statusFilter, sortKey, sortDir])

    const trendData = useMemo(() => {
        const list = Object.entries(dataMap[stationId] || {})
            .sort((a, b) => (a[0] > b[0] ? 1 : -1))
            .map(([d, e]) => {
                const t = calcTotals(e.tanks)
                return {
                    date: d,
                    vol20C: Number(t.totalVol20C.toFixed(3)),
                    mts: Number(t.totalMTS.toFixed(3)),
                    deliveryMT: Number(e.summary.netDeliveryMT.toFixed(3)),
                }
            })
        return list
    }, [dataMap, stationId])

    function clearFilters() {
        setQuery("")
        setStatusFilter("All")
        setSortKey("name")
        setSortDir("asc")
    }

    return (
        <main className="min-h-screen w-full bg-muted/30">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
                {/* Header / Toolbar */}
                <header className="mb-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TANKFARM DATA</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter daily stock data per station. Saved locally in your browser.
                            </p>
                        </div>

                        {/* Mobile sheet trigger */}
                        <div className="md:hidden">
                            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline">
                                        <Menu className="mr-2 h-4 w-4" />
                                        Controls
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[90vw] sm:max-w-sm">
                                    <SheetHeader>
                                        <SheetTitle>Controls</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4 grid gap-4">
                                        <StationControls
                                            stations={stations}
                                            stationId={stationId}
                                            onStationChange={setStationId}
                                            onManage={() => setManageStationsOpen(true)}
                                            date={date}
                                            onDateChange={setDate}
                                        />

                                        <FilterControls
                                            query={query}
                                            onQuery={setQuery}
                                            statusFilter={statusFilter}
                                            onStatusFilter={setStatusFilter}
                                            sortKey={sortKey}
                                            onSortKey={setSortKey}
                                            sortDir={sortDir}
                                            onSortDir={setSortDir}
                                        />

                                        <div className="grid gap-2">
                                            <Button onClick={saveCurrent}>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Day
                                            </Button>
                                            {/*<Button variant="outline" onClick={copyFromPrevious}>*/}
                                            {/*    <Copy className="mr-2 h-4 w-4" />*/}
                                            {/*    Copy Previous*/}
                                            {/*</Button>*/}

                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 bg-transparent"
                                                    variant="outline"
                                                    onClick={() => setShowRefs((s) => !s)}
                                                >
                                                    <Info className="mr-2 h-4 w-4" />
                                                    {showRefs ? "Hide Refs" : "Show Refs"}
                                                </Button>
                                                <Button className="flex-1 bg-transparent" variant="outline" onClick={resetSample}>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Reset
                                                </Button>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button className="flex-1 bg-transparent" variant="outline" onClick={exportCSV}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export
                                                </Button>
                                                <Button className="flex-1 bg-transparent" variant="outline" onClick={onPickFile}>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Import
                                                </Button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        const text = await file.text()
                                                        importCSV(text)
                                                        e.currentTarget.value = ""
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Desktop Controls */}
                    <div className="hidden md:grid grid-cols-1 xl:grid-cols-[1fr_auto] items-start gap-3">
                        <StationControls
                            stations={stations}
                            stationId={stationId}
                            onStationChange={setStationId}
                            onManage={() => setManageStationsOpen(true)}
                            date={date}
                            onDateChange={setDate}
                        />

                        <div className="flex items-end gap-2 justify-start xl:justify-end">
                            <Button onClick={saveCurrent}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Day
                            </Button>
                            <Button variant="outline" onClick={copyFromPrevious}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Previous
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        More
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setShowRefs((s) => !s)}>
                                        <Info className="mr-2 h-4 w-4" />
                                        {showRefs ? "Hide references" : "Show references"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={exportCSV}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onPickFile}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import CSV
                                    </DropdownMenuItem>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const text = await file.text()
                                            importCSV(text)
                                            e.currentTarget.value = ""
                                        }}
                                    />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={resetSample}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Reset Sample
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <FilterControls
                            className="md:col-span-1 xl:col-span-2"
                            query={query}
                            onQuery={setQuery}
                            statusFilter={statusFilter}
                            onStatusFilter={setStatusFilter}
                            sortKey={sortKey}
                            onSortKey={setSortKey}
                            sortDir={sortDir}
                            onSortDir={setSortDir}
                        />
                    </div>
                </header>

                {/* Summary cards and chart */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                    <SummaryCard
                        title="T/Farm Discharge"
                        value={`${formatNumber(summary.tfarmDischargeM3)} m3`}
                        icon={<Droplet className="h-4 w-4" />}
                        color="from-emerald-500/15 to-emerald-500/0"
                    />
                    <SummaryCard
                        title="Kigamboni Discharge"
                        value={`${formatNumber(summary.kigamboniDischargeM3)} m3`}
                        icon={<Factory className="h-4 w-4" />}
                        color="from-amber-500/20 to-amber-500/0"
                    />
                    <SummaryCard
                        title="Net Delivery @ 20C"
                        value={`${formatNumber(summary.netDeliveryM3At20C)} m3`}
                        icon={<Thermometer className="h-4 w-4" />}
                        color="from-rose-500/15 to-rose-500/0"
                    />
                    <SummaryCard
                        title="Net Delivery (MT)"
                        value={`${formatNumber(summary.netDeliveryMT)} MT`}
                        icon={<Package className="h-4 w-4" />}
                        color="from-violet-500/15 to-violet-500/0"
                    />
                </section>

                <Tabs defaultValue="table" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="table">Table</TabsTrigger>
                        <TabsTrigger value="remarks">Remarks & Summary</TabsTrigger>
                        <TabsTrigger value="trend">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Trend
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="space-y-6">
                        {/* Table */}
                        <section className="rounded-lg border bg-background shadow-sm">
                            <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    <h2 className="font-semibold">
                                        {"AA: Stock Position - "}
                                        {currentStationName(stations, stationId)}
                                        {" - "}
                                        {date}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={onAddNew}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Tank
                                    </Button>
                                    <Badge variant="outline">Pump over NFT: {new Date(summary.pumpOverDate).toLocaleDateString()}</Badge>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableCaption>All volumes in cubic meters unless otherwise specified.</TableCaption>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="min-w-[80px]">Tank</TableHead>
                                            <TableHead className="text-right">Level mm</TableHead>
                                            <TableHead className="text-right">Volume m3</TableHead>
                                            <TableHead className="text-right">Water cm</TableHead>
                                            <TableHead className="text-right">SG</TableHead>
                                            <TableHead className="text-right">Temp C</TableHead>
                                            <TableHead className="text-right">Vol m3 @ 20C</TableHead>
                                            <TableHead className="text-right">MTS</TableHead>
                                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSorted.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9}>
                                                    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                                        <p className="text-sm text-muted-foreground">No tanks match the current filters.</p>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" onClick={clearFilters}>
                                                                Clear filters
                                                            </Button>
                                                            <Button onClick={onAddNew}>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add Tank
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSorted.map((t) => (
                                                <TableRow
                                                    key={t.id}
                                                    className={cn(
                                                        "hover:bg-muted/50 transition-colors",
                                                        t.status === "Rehabilitation" && "opacity-70",
                                                    )}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <span>{t.name}</span>
                                                            {t.status === "Rehabilitation" && <Badge variant="secondary">Under Rehabilitation</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatNumber(t.levelMm)}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(t.volumeM3)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {t.waterCm === null ? "NIL" : formatNumber(t.waterCm)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(t.sg, { maximumFractionDigits: 4 })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(t.tempC, { maximumFractionDigits: 1 })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(t.volAt20C, { maximumFractionDigits: 3 })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(t.mts, { maximumFractionDigits: 3 })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => onEdit(t)}
                                                                aria-label={`Edit ${t.name}`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => onDelete(t)}
                                                                aria-label={`Delete ${t.name}`}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="font-semibold">TOTAL VOLUME</TableCell>
                                            <TableCell />
                                            <TableCell className="text-right font-semibold">{formatNumber(totals.totalVolume)}</TableCell>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell />
                                            <TableCell className="text-right font-semibold">{formatNumber(totals.totalVol20C)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatNumber(totals.totalMTS)}</TableCell>
                                            <TableCell />
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-semibold">PREV. VOLUME</TableCell>
                                            <TableCell />
                                            <TableCell className="text-right">{formatNumber(summary.prevVolumeM3)}</TableCell>
                                            <TableCell colSpan={5} />
                                            <TableCell />
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-semibold">OP. ULLAGE VOL</TableCell>
                                            <TableCell />
                                            <TableCell className="text-right">{formatNumber(summary.opUllageVolM3)}</TableCell>
                                            <TableCell colSpan={5} />
                                            <TableCell />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="remarks">
                        <section className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>CC: Remarks</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ul className="list-decimal pl-5 space-y-2">
                                        {remarks.map((r, idx) => (
                                            <li key={idx} className="leading-relaxed">
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                    <Separator />
                                    <RemarkEditor remarks={remarks} onChange={setRemarks} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Update Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <FieldNumber
                                        label="T/Farm Discharge (m3)"
                                        value={summary.tfarmDischargeM3}
                                        onChange={(v) => setSummary({ ...summary, tfarmDischargeM3: v })}
                                    />
                                    <FieldNumber
                                        label="Kigamboni Discharge (m3)"
                                        value={summary.kigamboniDischargeM3}
                                        onChange={(v) => setSummary({ ...summary, kigamboniDischargeM3: v })}
                                    />
                                    <FieldNumber
                                        label="Net Delivery @ 20C (m3)"
                                        value={summary.netDeliveryM3At20C}
                                        onChange={(v) => setSummary({ ...summary, netDeliveryM3At20C: v })}
                                    />
                                    <FieldNumber
                                        label="Net Delivery (MT)"
                                        value={summary.netDeliveryMT}
                                        onChange={(v) => setSummary({ ...summary, netDeliveryMT: v })}
                                    />
                                    <div className="grid gap-1">
                                        <Label htmlFor="pump">Pump over NFT Date</Label>
                                        <Input
                                            id="pump"
                                            type="date"
                                            value={summary.pumpOverDate}
                                            onChange={(e) => setSummary({ ...summary, pumpOverDate: e.target.value })}
                                        />
                                    </div>
                                    <Separator />
                                    <FieldNumber
                                        label="Prev. Volume (m3)"
                                        value={summary.prevVolumeM3}
                                        onChange={(v) => setSummary({ ...summary, prevVolumeM3: v })}
                                    />
                                    <FieldNumber
                                        label="Op. Ullage Vol (m3)"
                                        value={summary.opUllageVolM3}
                                        onChange={(v) => setSummary({ ...summary, opUllageVolM3: v })}
                                    />

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button onClick={saveCurrent}>
                                            <Save className="mr-2 h-4 w-4" /> Save Day
                                        </Button>
                                        <Button variant="outline" onClick={resetSample}>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reset Sample
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="trend">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {"Trend - "}
                                    {currentStationName(stations, stationId)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {trendData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No history yet. Save at least one day to view trends.</p>
                                ) : (
                                    <ChartContainer
                                        className="h-[320px]"
                                        config={{
                                            vol20C: { label: "Total m3 @20C", color: "hsl(var(--chart-1))" },
                                            mts: { label: "Total MTS", color: "hsl(var(--chart-2))" },
                                            deliveryMT: { label: "Delivery MT", color: "hsl(var(--chart-3))" },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData} margin={{ left: 12, right: 12, bottom: 12 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" fontSize={12} />
                                                <YAxis fontSize={12} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="vol20C"
                                                    name="Total m3 @20C"
                                                    stroke="var(--color-vol20C)"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="mts"
                                                    name="Total MTS"
                                                    stroke="var(--color-mts)"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="deliveryMT"
                                                    name="Delivery MT"
                                                    stroke="var(--color-deliveryMT)"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Reference images */}
                {showRefs && (
                    <section className="mt-6 space-y-4">
                        <h3 className="font-semibold text-lg">Reference Screenshots</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <ReferenceImage src="/images/tank-d1.png" alt="Tankfarm Data page 1 reference" />
                            <ReferenceImage src="/images/tank-d2.png" alt="Tankfarm Data page 2 reference" />
                        </div>
                    </section>
                )}

                {/* Tank create/edit */}
                <TankFormDialog
                    open={openForm}
                    onOpenChange={setOpenForm}
                    initial={editing ?? undefined}
                    onSubmit={(tank) => {
                        if (editing) {
                            setTanks((prev) => prev.map((x) => (x.id === editing.id ? { ...tank, id: editing.id } : x)))
                        } else {
                            setTanks((prev) => [{ ...tank, id: uid() }, ...prev])
                        }
                        setEditing(null)
                        setOpenForm(false)
                    }}
                />

                {/* Tank delete confirmation */}
                <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete {confirmDelete?.name}?</DialogTitle>
                            <DialogDescription>
                                This will remove the tank row from the table. You can re-add it later.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </Button>
                            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={doDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manage stations */}
                <ManageStationsDialog
                    open={manageStationsOpen}
                    onOpenChange={setManageStationsOpen}
                    stations={stations}
                    currentId={stationId}
                    onCreate={(name) => {
                        const s: Station = { id: uid(), name: name.trim() }
                        setStations((prev) => [s, ...prev])
                        setStationId(s.id)
                    }}
                    onRename={(id, name) => {
                        setStations((prev) => prev.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)))
                    }}
                    onDelete={(id) => {
                        setStations((prev) => prev.filter((s) => s.id !== id))
                        setDataMap((prev) => {
                            const copy = { ...prev }
                            delete copy[id]
                            return copy
                        })
                        setTimeout(() => {
                            setStationId((sid) => (sid === id ? (stations.filter((s) => s.id !== id)[0]?.id ?? "") : sid))
                        }, 0)
                    }}
                />

                {/* Floating add button on mobile */}
                <Button
                    size="icon"
                    className="md:hidden fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
                    onClick={onAddNew}
                    aria-label="Add tank"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </main>
    )
}

/* ---------- Sub-components ---------- */

function StationControls({
    stations,
    stationId,
    onStationChange,
    onManage,
    date,
    onDateChange,
}: {
    stations: Station[]
    stationId: string
    onStationChange: (id: string) => void
    onManage: () => void
    date: string
    onDateChange: (d: string) => void
}) {
    return (
        <div className="grid gap-2">
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
                <div>
                    <Label className="mb-1 block">Station</Label>
                    <div className="flex flex-wrap gap-2">
                        <Select value={stationId} onValueChange={onStationChange}>
                            <SelectTrigger className="w-full min-w-[180px]">
                                <SelectValue placeholder="Select station" />
                            </SelectTrigger>
                            <SelectContent>
                                {stations.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={onManage}>
                            <Settings className="mr-2 h-4 w-4" /> Manage
                        </Button>
                    </div>
                </div>

                <div>
                    <Label className="mb-1 block">Date</Label>
                    <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
                </div>
            </div>
        </div>
    )
}

function FilterControls({
    className,
    query,
    onQuery,
    statusFilter,
    onStatusFilter,
    sortKey,
    onSortKey,
    sortDir,
    onSortDir,
}: {
    className?: string
    query: string
    onQuery: (s: string) => void
    statusFilter: TankStatus | "All"
    onStatusFilter: (s: TankStatus | "All") => void
    sortKey: SortKey
    onSortKey: (s: SortKey) => void
    sortDir: "asc" | "desc"
    onSortDir: (d: "asc" | "desc") => void
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Label className="mb-1 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
            </Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1">
                    <Input
                        placeholder="Search tank by name..."
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="col-span-1">
                    <Select value={statusFilter} onValueChange={(v) => onStatusFilter(v as any)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
                    <Select value={sortKey} onValueChange={(v) => onSortKey(v as SortKey)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Tank</SelectItem>
                            <SelectItem value="volumeM3">Volume m3</SelectItem>
                            <SelectItem value="volAt20C">Vol @20C</SelectItem>
                            <SelectItem value="mts">MTS</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortDir} onValueChange={(v) => onSortDir(v as "asc" | "desc")}>
                        <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Asc</SelectItem>
                            <SelectItem value="desc">Desc</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}

/* ---------- Removed: Copy setup feature ---------- */
/* The copy setup dialog and related helpers were removed per request. */

function ManageStationsDialog({
    open,
    onOpenChange,
    stations,
    currentId,
    onCreate,
    onRename,
    onDelete,
}: {
    open: boolean
    onOpenChange: (o: boolean) => void
    stations: Station[]
    currentId: string
    onCreate: (name: string) => void
    onRename: (id: string, name: string) => void
    onDelete: (id: string) => void
}) {
    const [newName, setNewName] = useState("")
    const [edits, setEdits] = useState<Record<string, string>>({})

    useEffect(() => {
        if (open) {
            setEdits(Object.fromEntries(stations.map((s) => [s.id, s.name])))
            setNewName("")
        }
    }, [open, stations])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Manage Stations</DialogTitle>
                    <DialogDescription>Add, rename, or remove stations.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        {stations.map((s) => (
                            <div key={s.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Input
                                    value={edits[s.id] ?? ""}
                                    onChange={(e) => setEdits((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => onRename(s.id, edits[s.id] ?? s.name)}
                                        disabled={!edits[s.id]?.trim()}
                                    >
                                        Rename
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-destructive bg-transparent"
                                        onClick={() => onDelete(s.id)}
                                        disabled={stations.length <= 1 || s.id === currentId}
                                        title={s.id === currentId ? "Cannot delete the currently selected station" : ""}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                        <div className="flex-1">
                            <Label htmlFor="new-station">New station</Label>
                            <Input
                                id="new-station"
                                placeholder="e.g., Depot B"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => newName.trim() && onCreate(newName)}>Add</Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ---------- Small helpers & leaf components ---------- */

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    color = "from-emerald-500/10 to-emerald-500/0",
}: {
    title: string
    value: string
    subtitle?: string
    icon?: React.ReactNode
    color?: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
                    {icon ? (
                        <span
                            className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br", color)}
                        >
                            {icon}
                        </span>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle ? <div className="text-xs text-muted-foreground mt-1">{subtitle}</div> : null}
            </CardContent>
        </Card>
    )
}

function FieldNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="grid gap-1">
            <Label>{label}</Label>
            <Input
                type="number"
                value={Number.isFinite(value) ? value : 0}
                step="0.001"
                onChange={(e) => onChange(Number.parseFloat(e.target.value))}
            />
        </div>
    )
}

function ReferenceImage({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="rounded-lg border bg-background overflow-hidden">
            <Image
                src={src || "/placeholder.svg?height=800&width=1200&query=reference%20image"}
                alt={alt}
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
                priority={false}
            />
        </div>
    )
}

function TankFormDialog({
    open,
    onOpenChange,
    initial,
    onSubmit,
}: {
    open: boolean
    onOpenChange: (o: boolean) => void
    initial?: Tank
    onSubmit: (tank: Omit<Tank, "id">) => void
}) {
    const [name, setName] = useState(initial?.name ?? "")
    const [status, setStatus] = useState<TankStatus>(initial?.status ?? "Active")
    const [levelMm, setLevelMm] = useState<number | undefined>(initial?.levelMm)
    const [volumeM3, setVolumeM3] = useState<number | undefined>(initial?.volumeM3)
    const [waterCm, setWaterCm] = useState<number | null | undefined>(initial?.waterCm ?? undefined)
    const [sg, setSg] = useState<number | null | undefined>(initial?.sg ?? undefined)
    const [tempC, setTempC] = useState<number | null | undefined>(initial?.tempC ?? undefined)
    const [volAt20C, setVolAt20C] = useState<number | null | undefined>(initial?.volAt20C ?? undefined)
    const [mts, setMts] = useState<number | null | undefined>(initial?.mts ?? undefined)

    useEffect(() => {
        setName(initial?.name ?? "")
        setStatus(initial?.status ?? "Active")
        setLevelMm(initial?.levelMm)
        setVolumeM3(initial?.volumeM3)
        setWaterCm(initial?.waterCm ?? undefined)
        setSg(initial?.sg ?? undefined)
        setTempC(initial?.tempC ?? undefined)
        setVolAt20C(initial?.volAt20C ?? undefined)
        setMts(initial?.mts ?? undefined)
    }, [initial, open])

    function submit() {
        if (!name.trim()) return
        const base: Omit<Tank, "id"> = {
            name: name.trim().toUpperCase(),
            status,
            levelMm: status === "Active" ? toNum(levelMm) : undefined,
            volumeM3: status === "Active" ? toNum(volumeM3) : undefined,
            waterCm: status === "Active" ? toNullableNum(waterCm) : undefined,
            sg: status === "Active" ? toNullableNum(sg) : undefined,
            tempC: status === "Active" ? toNullableNum(tempC) : undefined,
            volAt20C: status === "Active" ? toNullableNum(volAt20C) : undefined,
            mts: status === "Active" ? toNullableNum(mts) : undefined,
        }
        onSubmit(base)
    }

    const disabledFields = status === "Rehabilitation"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initial ? `Edit ${initial.name}` : "Add Tank"}</DialogTitle>
                    <DialogDescription>Enter tank details. Use NIL for Water if not applicable.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2">
                            <Label htmlFor="tank-name">Tank Name</Label>
                            <Input id="tank-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="T7" />
                        </div>
                        <div className="col-span-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as TankStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <NumberField label="Level mm" value={levelMm} onChange={setLevelMm} disabled={disabledFields} />
                        <NumberField label="Volume m3" value={volumeM3} onChange={setVolumeM3} disabled={disabledFields} />
                        <NumberField
                            label="Water cm (NIL allowed)"
                            value={waterCm ?? undefined}
                            onChange={setWaterCm as any}
                            disabled={disabledFields}
                        />
                        <NumberField
                            label="SG"
                            value={sg ?? undefined}
                            onChange={setSg as any}
                            step={0.0001}
                            disabled={disabledFields}
                        />
                        <NumberField
                            label="Temp C"
                            value={tempC ?? undefined}
                            onChange={setTempC as any}
                            step={0.1}
                            disabled={disabledFields}
                        />
                        <NumberField
                            label="Vol m3 @ 20C"
                            value={volAt20C ?? undefined}
                            onChange={setVolAt20C as any}
                            disabled={disabledFields}
                        />
                        <NumberField label="MTS" value={mts ?? undefined} onChange={setMts as any} disabled={disabledFields} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={submit}>{initial ? "Save Changes" : "Add Tank"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function NumberField({
    label,
    value,
    onChange,
    disabled,
    step = 1,
}: {
    label: string
    value?: number
    onChange: (v?: number) => void
    disabled?: boolean
    step?: number
}) {
    return (
        <div className="grid gap-1">
            <Label>{label}</Label>
            <Input
                type="number"
                step={step}
                value={typeof value === "number" ? value : ""}
                onChange={(e) => {
                    const v = e.target.value
                    onChange(v === "" ? undefined : Number(v))
                }}
                disabled={disabled}
            />
        </div>
    )
}

/* ---------- Utility functions ---------- */

function currentStationName(stations: Station[], id: string) {
    return stations.find((s) => s.id === id)?.name ?? "Station"
}

function calcTotals(tanks: Tank[]) {
    const totalVolume = tanks.reduce((acc, t) => acc + (t.volumeM3 || 0), 0)
    const totalVol20C = tanks.reduce((acc, t) => acc + (t.volAt20C || 0), 0)
    const totalMTS = tanks.reduce((acc, t) => acc + (t.mts || 0), 0)
    return { totalVolume, totalVol20C, totalMTS }
}

function toNum(v?: number) {
    return typeof v === "number" && !Number.isNaN(v) ? v : 0
}
function toNullableNum(v?: number | null) {
    if (v === null) return null
    return typeof v === "number" && !Number.isNaN(v) ? v : 0
}
function toNumMaybe(v?: string) {
    if (v == null || v === "") return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
}
function numOrEmpty(n?: number | null) {
    return typeof n === "number" ? String(n) : ""
}
function safe(s: any) {
    return String(s ?? "").replace(/,/g, " ")
}
function findIdx(arr: string[], keys: string[]) {
    for (const k of keys) {
        const i = arr.findIndex((h) => h.replace(/\s+/g, "").toLowerCase() === k.replace(/\s+/g, "").toLowerCase())
        if (i >= 0) return i
    }
    return -1
}
function splitCsv(line: string) {
    // Simple CSV split supporting quoted values
    const out: string[] = []
    let cur = ""
    let inQ = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"' && line[i + 1] === '"') {
            cur += '"'
            i++
        } else if (ch === '"') {
            inQ = !inQ
        } else if (ch === "," && !inQ) {
            out.push(cur)
            cur = ""
        } else {
            cur += ch
        }
    }
    out.push(cur)
    return out.map((s) => s.trim())
}

function RemarkEditor({ remarks, onChange }: { remarks: string[]; onChange: (r: string[]) => void }) {
    const [draft, setDraft] = useState([...remarks])

    useEffect(() => {
        setDraft([...remarks])
    }, [remarks])

    const addRemark = () => {
        setDraft([...draft, ""])
    }

    const updateRemark = (index: number, value: string) => {
        const newDraft = [...draft]
        newDraft[index] = value
        setDraft(newDraft)
    }

    const deleteRemark = (index: number) => {
        const newDraft = draft.filter((_, i) => i !== index)
        setDraft(newDraft)
    }

    const saveRemarks = () => {
        onChange(draft.filter(Boolean)) // Save only non-empty remarks
    }

    return (
        <div className="space-y-2">
            {draft.map((remark, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Textarea
                        value={remark}
                        onChange={(e) => updateRemark(index, e.target.value)}
                        placeholder={`Remark ${index + 1}`}
                        className="flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => deleteRemark(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <div className="flex gap-2">
                <Button variant="outline" onClick={addRemark}>
                    Add Remark
                </Button>
                <Button onClick={saveRemarks}>Save Remarks</Button>
            </div>
        </div>
    )
}
