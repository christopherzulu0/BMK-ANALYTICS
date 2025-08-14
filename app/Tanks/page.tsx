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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
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
    Package, ViewIcon,
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  getEntry as apiGetEntry,
  saveEntry as apiSaveEntry,
  listStations as apiListStations,
  createStation as apiCreateStation,
  renameStation as apiRenameStation,
  deleteStation as apiDeleteStation,
  listEntryHistory as apiListEntryHistory,
} from "@/lib/api"
import {TankVisualization} from "@/components/tank-visualization";

type TankStatus = "Active" | "Rehabilitation"

type Tank = {
  id: string
  name: string
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

function emptySummary(date: string): DischargeSummary {
  return {
    tfarmDischargeM3: 0,
    kigamboniDischargeM3: 0,
    netDeliveryM3At20C: 0,
    netDeliveryMT: 0,
    pumpOverDate: date,
    prevVolumeM3: 0,
    opUllageVolM3: 0,
  }
}

function formatNumber(value: number | null | undefined, opts: Intl.NumberFormatOptions = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3, ...opts }).format(value)
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

type DataMap = Record<string, Record<string, EntryData>>
type SortKey = "name" | "volumeM3" | "volAt20C" | "mts"

export default function Page() {
  const { toast } = useToast()

  const [stations, setStations] = useState<Station[]>([])
  const [stationId, setStationId] = useState<string>("")

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))

  const [dataMap, setDataMap] = useState<DataMap>({})

  const [tanks, setTanks] = useState<Tank[]>([])
  const [summary, setSummary] = useState<DischargeSummary>(emptySummary(new Date().toISOString().slice(0, 10)))
  const [remarks, setRemarks] = useState<string[]>([])

  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Tank | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Tank | null>(null)
  const [showRefs, setShowRefs] = useState(false)
  const [manageStationsOpen, setManageStationsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TankStatus | "All">("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const fileInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    let ignore = false
    apiListStations()
      .then((rows) => {
        if (ignore) return
        if (Array.isArray(rows) && rows.length) {
          setStations(rows.map((r) => ({ id: r.id, name: r.name })))
          setStationId(rows[0].id)
        }
      })
      .catch(() => {
        // ignore; DB not configured yet
      })
    return () => {
      ignore = true
    }
  }, [])

  // Load full history for the selected station to populate trend data
  useEffect(() => {
    let ignore = false
    if (!stationId) {
      return
    }
    apiListEntryHistory(stationId)
      .then((rows) => {
        if (ignore) return
        if (Array.isArray(rows) && rows.length) {
          setDataMap((prev) => {
            const next = { ...prev }
            const stationEntries: Record<string, any> = {}
            for (const r of rows) {
              stationEntries[r.date] = { tanks: r.entry.tanks, summary: r.entry.summary, remarks: r.entry.remarks || [] }
            }
            next[stationId] = stationEntries
            return next
          })
        } else {
          // No history: clear station map to avoid stale data
          setDataMap((prev) => ({ ...prev, [stationId]: {} as any }))
        }
      })
      .catch(() => {
        // ignore errors; trend will just show empty state
      })
    return () => {
      ignore = true
    }
  }, [stationId])

  useEffect(() => {
    let cancelled = false

    if (!stationId) {
      // No station selected; ensure empty state
      setTanks([])
      setSummary(emptySummary(date))
      setRemarks([])
      return
    }

    apiGetEntry(stationId, date)
      .then((entry) => {
        if (cancelled) return
        if (entry) {
          setTanks(
            entry.tanks.map((t) => ({
              id: uid(),
              name: t.name,
              status: (t.status === "Rehabilitation" ? "Rehabilitation" : "Active") as any,
              levelMm: t.levelMm,
              volumeM3: t.volumeM3,
              waterCm: t.waterCm ?? undefined,
              sg: t.sg ?? undefined,
              tempC: t.tempC ?? undefined,
              volAt20C: t.volAt20C ?? undefined,
              mts: t.mts ?? undefined,
            })),
          )
          setSummary({
            tfarmDischargeM3: entry.summary.tfarmDischargeM3,
            kigamboniDischargeM3: entry.summary.kigamboniDischargeM3,
            netDeliveryM3At20C: entry.summary.netDeliveryM3At20C,
            netDeliveryMT: entry.summary.netDeliveryMT,
            pumpOverDate: entry.summary.pumpOverDate || date,
            prevVolumeM3: entry.summary.prevVolumeM3,
            opUllageVolM3: entry.summary.opUllageVolM3,
          })
          setRemarks(entry.remarks ?? [])
          return
        }
        // No entry in DB; keep empty state
        setTanks([])
        setSummary(emptySummary(date))
        setRemarks([])
      })
      .catch(() => {
        // On error, keep empty state (no fallback data)
        setTanks([])
        setSummary(emptySummary(date))
        setRemarks([])
      })
    return () => {
      cancelled = true
    }
  }, [stationId, date])

  useEffect(() => {
    function isEditableTarget(el: EventTarget | null) {
      const node = el as HTMLElement | null
      if (!node) return false
      if (node.isContentEditable) return true
      const tag = node.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || tag === "select") return true
      if (node.closest?.("[role='combobox']")) return true
      return false
    }

    function onKey(e: KeyboardEvent) {
      if (e.repeat) return
      if (isEditableTarget(e.target)) return
      if (openForm || manageStationsOpen || sheetOpen) return

      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault()
        saveCurrent()
      } else if (!e.ctrlKey && !e.metaKey && key === "n") {
        e.preventDefault()
        onAddNew()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tanks, summary, remarks, stationId, date, openForm, manageStationsOpen, sheetOpen])

  const totals = useMemo(() => calcTotals(tanks), [tanks])

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


  function saveCurrent(overrides?: { remarks?: string[] }) {
    const nextRemarks = overrides?.remarks ?? remarks

    setDataMap((prev) => {
      const stationEntries = { ...(prev[stationId] || {}) }
      stationEntries[date] = { tanks, summary, remarks: nextRemarks }
      return { ...prev, [stationId]: stationEntries }
    })
    toast({ title: "Saved", description: `${currentStationName(stations, stationId)} - ${date}` })

    // Save to DB with proper error handling
    saveToDatabaseAsync()

    async function saveToDatabaseAsync() {
      try {
        console.log("Attempting to save to database...", { stationId, date, tanksCount: tanks.length })

        await apiSaveEntry({
          stationId,
          date,
          entry: {
            tanks: tanks.map(({ name, status, levelMm, volumeM3, waterCm, sg, tempC, volAt20C, mts }) => ({
              name,
              status,
              levelMm,
              volumeM3,
              waterCm: waterCm === null ? null : waterCm,
              sg,
              tempC,
              volAt20C,
              mts,
            })),
            summary: { ...summary },
            remarks: nextRemarks,
          },
        })

        console.log("Successfully saved to database")
        toast({
          title: "Saved to database",
          description: `${currentStationName(stations, stationId)} - ${date}`,
        })
      } catch (e: any) {
        console.error("Database save failed:", e)
        toast({
          title: "Database save failed",
          description: e?.message || "Check server logs/connection",
          variant: "destructive" as any,
        })
      }
    }
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
        <header className="mb-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-pretty">TANKFARM DATA</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Enter daily stock data per station.
              </p>
            </div>

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
                      {/*<Button onClick={saveCurrent}>*/}
                      {/*  <Save className="mr-2 h-4 w-4" />*/}
                      {/*  Save Day*/}
                      {/*</Button>*/}
                      {/*<Button variant="outline" onClick={copyFromPrevious}>*/}
                      {/*  <Copy className="mr-2 h-4 w-4" />*/}
                      {/*  Copy Previous*/}
                      {/*</Button>*/}

                      {/*<div className="flex gap-2">*/}
                      {/*  <Button*/}
                      {/*    className="flex-1 bg-transparent"*/}
                      {/*    variant="outline"*/}
                      {/*    onClick={() => setShowRefs((s) => !s)}*/}
                      {/*  >*/}
                      {/*    <Info className="mr-2 h-4 w-4" />*/}
                      {/*    {showRefs ? "Hide Refs" : "Show Refs"}*/}
                      {/*  </Button>*/}
                      {/*</div>*/}

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-transparent" variant="outline" onClick={exportCSV}>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        {/*<Button className="flex-1 bg-transparent" variant="outline" onClick={onPickFile}>*/}
                        {/*  <Upload className="mr-2 h-4 w-4" />*/}
                        {/*  Import*/}
                        {/*</Button>*/}
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

          <div className="hidden md:grid grid-cols-1 xl:grid-cols-[1fr_auto] items-start gap-3">
            <StationControls
              stations={stations}
              stationId={stationId}
              onStationChange={setStationId}
              onManage={() => setManageStationsOpen(true)}
              date={date}
              onDateChange={setDate}
            />

            <div className="flex items-end gap-2 justify-start xl:justify-end mt-5">
              {/*<Button onClick={saveCurrent}>*/}
              {/*  <Save className="mr-2 h-4 w-4" />*/}
              {/*  Save Day*/}
              {/*</Button>*/}
              {/*<Button variant="outline" onClick={copyFromPrevious}>*/}
              {/*  <Copy className="mr-2 h-4 w-4" />*/}
              {/*  Copy Previous*/}
              {/*</Button>*/}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ChevronDown className="mr-2 h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {/*<DropdownMenuItem onClick={() => setShowRefs((s) => !s)}>*/}
                  {/*  <Info className="mr-2 h-4 w-4" />*/}
                  {/*  {showRefs ? "Hide references" : "Show references"}*/}
                  {/*</DropdownMenuItem>*/}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                  {/*<DropdownMenuItem onClick={onPickFile}>*/}
                  {/*  <Upload className="mr-2 h-4 w-4" />*/}
                  {/*  Import CSV*/}
                  {/*</DropdownMenuItem>*/}
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6 ">
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
              <TabsTrigger value="3D">
                  <ViewIcon className="h-4 w-4 mr-2" />
                  3D View
              </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-6">
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
            <section className="grid gap-4 lg:grid-cols-2 mb-10">
              <Card>
                <CardHeader>
                  <CardTitle>CC: Remarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="list-decimal pl-5 space-y-2">
                    {remarks.map((r, idx) => (
                      <li key={idx} className="leading-relaxed flex items-start gap-2">
                        <span className="flex-1 whitespace-pre-wrap break-words">{r}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove remark ${idx + 1}`}
                          onClick={() => {
                            const next = remarks.slice()
                            next.splice(idx, 1)
                            setRemarks(next)
                            try {
                              console.log("Remark removed at index:", idx)
                            } catch {}
                            // Persist immediately for visibility
                            saveCurrent({ remarks: next })
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <RemarkEditor
                    remarks={remarks}
                    onChange={(r) => {
                      setRemarks(r)
                      try {
                        console.log("Remark added/updated:", r[r.length - 1])
                      } catch {}
                      // Persist immediately to provide feedback and logs
                      saveCurrent({ remarks: r })
                    }}
                  />
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

            <TabsContent value="3D">
                {(() => {
                  // Build a visualization-friendly dataset from entries data
                  const vols = tanks.map(t => (t.volAt20C ?? 0) || 0)
                  const maxVol = vols.length ? Math.max(...vols, 0) : 0
                  const safeMax = maxVol > 0 ? maxVol : 1 // avoid divide-by-zero

                  const vizTanks = tanks.map((t, idx) => {
                    const vol = vols[idx]
                    const levelPct = Math.max(0, Math.min(100, Math.round((vol / safeMax) * 100)))
                    return {
                      id: t.name || String(idx + 1),
                      name: t.name,
                      level: levelPct,
                      product: "Diesel LSG" as const,
                      capacity: Math.round(safeMax),
                      volAt20C: t.volAt20C ?? undefined,
                    }
                  })

                  return <TankVisualization tanks={vizTanks} />
                })()}
            </TabsContent>
        </Tabs>


        {showRefs && (
          <section className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg">Reference Screenshots</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <ReferenceImage src="/images/tank-d1.png" alt="Tankfarm Data page 1 reference" />
              <ReferenceImage src="/images/tank-d2.png" alt="Tankfarm Data page 2 reference" />
            </div>
          </section>
        )}

        <TankFormDialog
          key={editing ? editing.id : "new"}
          open={openForm}
          onOpenChange={setOpenForm}
          initial={editing ?? undefined}
          onSubmit={(tank) => {
            // Compute the next tanks array synchronously so we can save immediately
            let nextTanks: Tank[]
            if (editing) {
              nextTanks = tanks.map((x) => (x.id === editing.id ? { ...tank, id: editing.id } : x))
            } else {
              nextTanks = [{ ...tank, id: uid() }, ...tanks]
            }
            setTanks(nextTanks)
            setEditing(null)
            setOpenForm(false)

            // Persist to local cache (same as saveCurrent)
            setDataMap((prev) => {
              const stationEntries = { ...(prev[stationId] || {}) }
              stationEntries[date] = { tanks: nextTanks, summary, remarks }
              return { ...prev, [stationId]: stationEntries }
            })

            // Persist to database immediately and log the attempt
            console.log("Attempting to save to database from TankFormDialog...", {
              stationId,
              date,
              tanksCount: nextTanks.length,
            })

            apiSaveEntry({
              stationId,
              date,
              entry: {
                tanks: nextTanks.map(({ name, status, levelMm, volumeM3, waterCm, sg, tempC, volAt20C, mts }) => ({
                  name,
                  status,
                  levelMm,
                  volumeM3,
                  waterCm: waterCm === null ? null : waterCm,
                  sg,
                  tempC,
                  volAt20C,
                  mts,
                })),
                summary: { ...summary },
                remarks,
              },
            })
              .then(() => {
                console.log("Successfully saved to database from TankFormDialog")
                toast({
                  title: "Saved to database",
                  description: `${currentStationName(stations, stationId)} - ${date}`,
                })
              })
              .catch((e) => {
                console.error("Database save failed from TankFormDialog:", e)
                toast({
                  title: "Database save failed",
                  description: (e as any)?.message || "Check server logs/connection",
                  variant: "destructive" as any,
                })
              })
          }}
        />

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

        <ManageStationsDialog
          open={manageStationsOpen}
          onOpenChange={setManageStationsOpen}
          stations={stations}
          currentId={stationId}
          onCreate={(name) => {
            apiCreateStation(name)
              .then((s) => {
                const st = { id: s.id, name: s.name }
                setStations((prev) => [st, ...prev])
                setStationId(st.id)
              })
              .catch((e) => toast({ title: "Create failed", description: String(e), variant: "destructive" as any }))
          }}
          onRename={(id, name) => {
            apiRenameStation(id, name)
              .then((s) => setStations((prev) => prev.map((x) => (x.id === id ? { ...x, name: s.name } : x))))
              .catch((e) => toast({ title: "Rename failed", description: String(e), variant: "destructive" as any }))
          }}
          onDelete={(id) => {
            apiDeleteStation(id)
              .then(() => {
                setStations((prev) => prev.filter((s) => s.id !== id))
                setDataMap((prev) => {
                  const copy = { ...prev }
                  delete copy[id]
                  return copy
                })
                setTimeout(() => {
                  setStationId((sid) => (sid === id ? (stations.filter((s) => s.id !== id)[0]?.id ?? "") : sid))
                }, 0)
              })
              .catch((e) => toast({ title: "Delete failed", description: String(e), variant: "destructive" as any }))
          }}
        />

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

function calcTotals(tanks: Tank[]) {
  const totalVolume = tanks.reduce((acc, t) => acc + (t.volumeM3 || 0), 0)
  const totalVol20C = tanks.reduce((acc, t) => acc + (t.volAt20C || 0), 0)
  const totalMTS = tanks.reduce((acc, t) => acc + (t.mts || 0), 0)
  return { totalVolume, totalVol20C, totalMTS }
}

function currentStationName(stations: Station[], stationId: string) {
  return stations.find((s) => s.id === stationId)?.name || "Unknown"
}

function safe(str: any) {
  return String(str).replace(/,/g, "")
}
function numOrEmpty(val: number | null | undefined) {
  if (val === null || val === undefined) return ""
  return val
}

function findIdx(header: string[], candidates: string[]) {
  for (const c of candidates) {
    const idx = header.indexOf(c)
    if (idx >= 0) return idx
  }
  return -1
}

function splitCsv(str: string) {
  const separator = ","
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(?:^|${escapedSeparator})("(?:[^"]|"")*"|[^"${escapedSeparator}]*)`, "gi")
  const arr = []
  let curMatch
  while ((curMatch = regex.exec(str))) {
    arr.push(curMatch[1] ? curMatch[1].replace(/^"|"$/g, "").replace(/""/g, '"') : "")
  }
  return arr
}

function toNumMaybe(str: string | undefined) {
  if (!str) return undefined
  const num = Number(str)
  if (Number.isNaN(num)) return undefined
  return num
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg md:text-xl text-muted-foreground   text-pretty">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{/* +20.1% from last month */}</p>
      </CardContent>
    </Card>
  )
}

function RemarkEditor({ remarks, onChange }: { remarks: string[]; onChange: (r: string[]) => void }) {
  const [draft, setDraft] = useState("")
  const maxLen = 1000
  const remaining = maxLen - draft.length

  function addRemark() {
    const text = draft.trim()
    if (!text) return
    const clipped = text.length > maxLen ? text.slice(0, maxLen) : text
    onChange([...remarks, clipped])
    setDraft("")
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, maxLen))}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault()
              addRemark()
            }
          }}
          placeholder="New remark..."
        />
        <div className="text-xs text-muted-foreground text-right">{remaining} characters left</div>
      </div>
      <Button onClick={addRemark} disabled={!draft.trim()}>
        Add Remark
      </Button>
    </div>
  )
}

function FieldNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

function ReferenceImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={600}
      height={400}
      className="rounded-md border shadow-md aspect-video object-cover"
    />
  )
}

function TankFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Tank
  onSubmit: (tank: Omit<Tank, "id">) => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [status, setStatus] = useState<TankStatus>(initial?.status || "Active")
  const [levelMm, setLevelMm] = useState(initial?.levelMm ?? 0)
  const [volumeM3, setVolumeM3] = useState(initial?.volumeM3 ?? 0)
  const [waterCm, setWaterCm] = useState(initial?.waterCm ?? null)
  const [sg, setSg] = useState(initial?.sg ?? 0)
  const [tempC, setTempC] = useState(initial?.tempC ?? 0)
  const [volAt20C, setVolAt20C] = useState(initial?.volAt20C ?? 0)
    const [mts, setMts] = useState(initial?.mts ?? 0)




  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">{initial ? "Edit Tank" : "Add Tank"}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Enter tank details to save.</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                          Basic Information
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                          {/*<div className="space-y-2">*/}
                          {/*    <Label htmlFor="name" className="text-sm font-medium">*/}
                          {/*        Tank Name*/}
                          {/*    </Label>*/}
                          {/*    <Input*/}
                          {/*        id="name"*/}
                          {/*        value={name}*/}
                          {/*        onChange={(e) => setName(e.target.value)}*/}
                          {/*        placeholder="Enter tank name"*/}
                          {/*        className="w-full"*/}
                          {/*    />*/}
                          {/*</div>*/}
                          <Select value={name} onValueChange={setName}>
                              <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select Tank" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectGroup>
                                      <SelectLabel>Tanks</SelectLabel>
                                      <SelectItem value="T1">T1</SelectItem>
                                      <SelectItem value="T2">T2</SelectItem>
                                      <SelectItem value="T3">T3</SelectItem>
                                      <SelectItem value="T4">T4</SelectItem>
                                      <SelectItem value="T5">T5</SelectItem>
                                      <SelectItem value="T6">T6</SelectItem>
                                  </SelectGroup>
                              </SelectContent>
                          </Select>

                          <div className="space-y-2">
                              <Label htmlFor="status" className="text-sm font-medium">
                                  Status
                              </Label>
                              <Select value={status} onValueChange={setStatus}>
                                  <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Active">Active</SelectItem>
                                      <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </div>

                  {/* Physical Measurements Section */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                          Physical Measurements
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2">
                              <Label htmlFor="levelMm" className="text-sm font-medium">
                                  Level (mm)
                              </Label>
                              <Input
                                  id="levelMm"
                                  type="number"
                                  value={levelMm}
                                  onChange={(e) => setLevelMm(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full"
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="volumeM3" className="text-sm font-medium">
                                  Volume (m³)
                              </Label>
                              <Input
                                  id="volumeM3"
                                  type="number"
                                  value={volumeM3}
                                  onChange={(e) => setVolumeM3(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full"
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="waterCm" className="text-sm font-medium">
                                  Water (cm)
                              </Label>
                              <Input
                                  id="waterCm"
                                  type="number"
                                  value={waterCm === null ? "" : waterCm}
                                  onChange={(e) => setWaterCm(e.target.value === "" ? null : Number(e.target.value))}
                                  placeholder="NIL"
                                  className="w-full"
                              />
                          </div>
                      </div>
                  </div>

                  {/* Technical Properties Section */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                          Technical Properties
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2">
                              <Label htmlFor="sg" className="text-sm font-medium">
                                  Specific Gravity (SG)
                              </Label>
                              <Input
                                  id="sg"
                                  type="number"
                                  value={sg}
                                  onChange={(e) => setSg(Number(e.target.value))}
                                  placeholder="0"
                                  step="0.001"
                                  className="w-full"
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="tempC" className="text-sm font-medium">
                                  Temperature (°C)
                              </Label>
                              <Input
                                  id="tempC"
                                  type="number"
                                  value={tempC}
                                  onChange={(e) => setTempC(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full"
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="volAt20C" className="text-sm font-medium">
                                  Vol (m³) @ 20°C
                              </Label>
                              <Input
                                  id="volAt20C"
                                  type="number"
                                  value={volAt20C}
                                  onChange={(e) => setVolAt20C(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full"
                              />
                          </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2">
                              <Label htmlFor="mts" className="text-sm font-medium">
                                  MTS
                              </Label>
                              <Input
                                  id="mts"
                                  type="number"
                                  value={mts}
                                  onChange={(e) => setMts(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                      Cancel
                  </Button>
                  <Button
                      type="button"
                      onClick={() => {
                          console.log("TankFormDialog save clicked", {
                              name,
                              status,
                              levelMm,
                              volumeM3,
                              waterCm,
                              sg,
                              tempC,
                              volAt20C,
                              mts,
                          })
                          onSubmit({ name, status, levelMm, volumeM3, waterCm, sg, tempC, volAt20C, mts })
                      }}
                      className="w-full sm:w-auto"
                  >
                      {initial ? "Update" : "Save"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  )
}

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
  onOpenChange: (open: boolean) => void
  stations: Station[]
  currentId: string
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamedName, setRenamedName] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Stations</DialogTitle>
          <DialogDescription>Create, rename, or delete stations.</DialogDescription>
        </DialogHeader>

        <section className="space-y-4 py-4">
          <ul className="space-y-2">
            {stations.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                {renamingId === s.id ? (
                  <div className="flex-1 grid grid-cols-[1fr_auto] gap-2">
                    <Input value={renamedName} onChange={(e) => setRenamedName(e.target.value)} />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => {
                          onRename(s.id, renamedName)
                          setRenamingId(null)
                        }}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRenamingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">{s.name}</div>
                    <div className="flex gap-1.5">
                      {stations.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (s.id === currentId) {
                              alert("Cannot delete current station. Switch to another station first.")
                              return
                            }
                            if (confirm(`Delete station ${s.name}?`)) {
                              onDelete(s.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setRenamingId(s.id)
                          setRenamedName(s.name)
                        }}
                      >
                        Rename
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {creating ? (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Input placeholder="New station name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() => {
                    onCreate(newName)
                    setCreating(false)
                    setNewName("")
                  }}
                >
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setCreating(true)}>
              Add Station
            </Button>
          )}
        </section>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
