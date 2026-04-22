'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFuelStations,
  createFuelStation,
  deleteFuelStation,
  renameFuelStation,
  getMonthlyFuelData,
  upsertFuelEntry,
} from '../../lib/actions/dra'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Plus, Trash2, Loader2, Printer, Download, Edit2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const LOW_STOCK_DEFAULT = 500

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

// ─── Editable Cell ────────────────────────────────────────────────────────────
function MatrixCell({
  value,
  onSave,
  highlight,
}: {
  value: number | null | undefined
  onSave: (val: number | null) => void
  highlight?: boolean
}) {
  const [local, setLocal] = useState(value != null ? String(value) : '')

  // Sync when external value changes (e.g. after reload)
  const prevValue = useRef(value)
  if (prevValue.current !== value) {
    prevValue.current = value
    setLocal(value != null ? String(value) : '')
  }

  const handleBlur = () => {
    const parsed = local.trim() === '' ? null : Number(local)
    if (parsed === null || !isNaN(parsed)) onSave(parsed)
  }

  return (
    <input
      type="number"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={handleBlur}
      className={cn(
        'w-full min-w-[64px] h-7 px-1 text-xs text-center bg-transparent border-0 focus:outline-none focus:bg-primary/5 rounded tabular-nums',
        highlight && 'bg-red-500/15 text-red-400 font-semibold'
      )}
      placeholder="—"
    />
  )
}

// ─── Inline Station Rename ─────────────────────────────────────────────────────
function StationHeader({
  station,
  onRename,
  onDelete,
}: {
  station: { id: string; name: string }
  onRename: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(station.name)

  const commit = () => {
    if (draft.trim() && draft.trim() !== station.name) {
      onRename(station.id, draft.trim())
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-center">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-24 text-xs border border-border rounded px-1 py-0.5 bg-background text-center"
        />
        <button onClick={commit} className="text-emerald-500 hover:text-emerald-400"><Check className="h-3 w-3" /></button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1 group">
      <span>{station.name}</span>
      <button onClick={() => { setDraft(station.name); setEditing(true) }} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
        <Edit2 className="h-3 w-3" />
      </button>
      <button onClick={() => onDelete(station.id, station.name)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-destructive">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DraInput() {
  const queryClient = useQueryClient()

  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [newStationName, setNewStationName] = useState('')
  const [addingStation, setAddingStation]   = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState(LOW_STOCK_DEFAULT)

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: stations = [], isLoading: loadingStations } = useQuery({
    queryKey: ['fuel-stations'],
    queryFn: getFuelStations,
  })

  const { data: entries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ['monthly-fuel', year, month],
    queryFn: () => getMonthlyFuelData(year, month),
  })

  // entryMap[stationId][day] = entry
  const entryMap = useMemo(() => {
    const map: Record<string, Record<number, any>> = {}
    for (const e of entries) {
      if (!map[e.stationId]) map[e.stationId] = {}
      map[e.stationId][new Date(e.date).getUTCDate()] = e
    }
    return map
  }, [entries])

  // ── Pre-compute totals ─────────────────────────────────────────────────────
  const totalDays = daysInMonth(year, month)

  const rowTotals = useMemo(() => {
    const rt: Record<number, { consumption: number; stock: number }> = {}
    for (let d = 1; d <= totalDays; d++) {
      let c = 0, s = 0
      for (const st of stations) {
        c += entryMap[st.id]?.[d]?.consumption ?? 0
        s += entryMap[st.id]?.[d]?.stock ?? 0
      }
      rt[d] = { consumption: c, stock: s }
    }
    return rt
  }, [entryMap, stations, totalDays])

  const colTotals = useMemo(() => {
    const ct: Record<string, { consumption: number; stock: number }> = {}
    for (const st of stations) {
      let c = 0, s = 0
      for (let d = 1; d <= totalDays; d++) {
        c += entryMap[st.id]?.[d]?.consumption ?? 0
        s += entryMap[st.id]?.[d]?.stock ?? 0
      }
      ct[st.id] = { consumption: c, stock: s }
    }
    return ct
  }, [entryMap, stations, totalDays])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addStationMutation = useMutation({
    mutationFn: (name: string) => createFuelStation(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] })
      setNewStationName('')
      setAddingStation(false)
      toast.success('Station added')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const deleteStationMutation = useMutation({
    mutationFn: (id: string) => deleteFuelStation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-fuel', year, month] })
      toast.success('Station removed')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const renameStationMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameFuelStation(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] })
      toast.success('Station renamed')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const upsertMutation = useMutation({
    mutationFn: ({ date, stationId, consumption, stock, remarks }: any) =>
      upsertFuelEntry(date, stationId, consumption, stock, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fuel', year, month] })
    },
    onError: (e: any) => toast.error(`Save failed: ${e.message}`)
  })

  const handleSave = useCallback(
    (day: number, stationId: string, field: 'consumption' | 'stock', val: number | null) => {
      const date = new Date(year, month - 1, day)
      const existing = entryMap[stationId]?.[day]
      upsertMutation.mutate({
        date, stationId,
        consumption: field === 'consumption' ? val : (existing?.consumption ?? null),
        stock:       field === 'stock'       ? val : (existing?.stock       ?? null),
        remarks: existing?.remarks,
      })
    },
    [year, month, entryMap, upsertMutation]
  )

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Date', ...stations.flatMap(s => [`${s.name} Consumption`, `${s.name} Stock`]), 'Total Consumption', 'Total Stock', 'Remarks']
    const rows = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1
      const dateStr = new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      const cells = stations.flatMap(s => [
        entryMap[s.id]?.[day]?.consumption ?? '',
        entryMap[s.id]?.[day]?.stock ?? '',
      ])
      const remarks = stations.map(s => entryMap[s.id]?.[day]?.remarks).find(r => r) || ''
      return [dateStr, ...cells, rowTotals[day]?.consumption || 0, rowTotals[day]?.stock || 0, remarks]
    })
    const totalsRow = ['TOTAL', ...stations.flatMap(s => [colTotals[s.id]?.consumption || 0, colTotals[s.id]?.stock || 0]), '', '', '']
    const csv = [headers, ...rows, totalsRow].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `fuel-consumption-${MONTHS[month-1]}-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  const isLoading = loadingStations || loadingEntries

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">DRA Consumption</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MONTHS[month - 1].toUpperCase()}, {year}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month / Year */}
          <div className="flex items-center gap-1 border border-border rounded-lg bg-secondary px-3 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="bg-transparent text-sm border-0 focus:outline-none cursor-pointer" style={{ colorScheme: 'dark' }}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-transparent text-sm border-0 focus:outline-none cursor-pointer ml-1" style={{ colorScheme: 'dark' }}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Add Station */}
          {addingStation ? (
            <div className="flex items-center gap-1">
              <Input autoFocus value={newStationName} onChange={e => setNewStationName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newStationName.trim()) addStationMutation.mutate(newStationName.trim())
                  if (e.key === 'Escape') setAddingStation(false)
                }}
                placeholder="Station name..." className="h-8 w-40 text-sm" />
              <Button size="sm" disabled={!newStationName.trim() || addStationMutation.isPending}
                onClick={() => addStationMutation.mutate(newStationName.trim())}>
                {addStationMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingStation(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddingStation(true)}>
              <Plus className="h-4 w-4" /> Add Station
            </Button>
          )}

          <div className="flex items-center gap-1 border border-border rounded-lg bg-secondary px-2 py-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Low Stock &lt;</span>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(Math.max(0, Number(e.target.value)))}
              className="w-20 bg-transparent text-sm border-0 focus:outline-none text-center font-medium"
              min={0}
            />
            <span className="text-xs text-muted-foreground">L</span>
          </div>

          <Button size="sm" variant="outline" className="gap-1" onClick={handleExport} disabled={stations.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          {/* <Button size="sm" variant="outline" className="gap-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button> */}
        </div>
      </div>

      {/* Matrix */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-lg gap-3">
          <p className="text-muted-foreground text-sm">No stations yet.</p>
          <Button size="sm" onClick={() => setAddingStation(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add your first station
          </Button>
        </div>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Row 1 — Station names */}
              <tr className="bg-secondary">
                <th className="border border-border px-3 py-2 text-left font-semibold whitespace-nowrap sticky left-0 bg-secondary z-10">Date</th>
                {stations.map(station => (
                  <th key={station.id} colSpan={2} className="border border-border px-2 py-2 text-center font-semibold whitespace-nowrap">
                    <StationHeader
                      station={station}
                      onRename={(id, name) => renameStationMutation.mutate({ id, name })}
                      onDelete={(id, name) => {
                        if (confirm(`Remove station "${name}" and all its data?`)) deleteStationMutation.mutate(id)
                      }}
                    />
                  </th>
                ))}
                <th colSpan={2} className="border border-border px-2 py-2 text-center font-semibold whitespace-nowrap bg-primary/10">Daily Total</th>
                <th className="border border-border px-2 py-2 text-center font-semibold whitespace-nowrap">Remarks</th>
              </tr>
              {/* Row 2 — Sub-headers */}
              <tr className="bg-secondary/70">
                <th className="border border-border px-3 py-1 sticky left-0 bg-secondary/70 z-10" />
                {stations.map(station => (
                  <React.Fragment key={station.id}>
                    <th className="border border-border px-2 py-1 text-center font-medium text-muted-foreground">Consumption</th>
                    <th className="border border-border px-2 py-1 text-center font-medium text-muted-foreground">Stock</th>
                  </React.Fragment>
                ))}
                <th className="border border-border px-2 py-1 text-center font-medium text-muted-foreground bg-primary/5">Consumption</th>
                <th className="border border-border px-2 py-1 text-center font-medium text-muted-foreground bg-primary/5">Stock</th>
                <th className="border border-border px-2 py-1" />
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                <tr key={day} className="hover:bg-muted/20 transition-colors">
                  {/* Date */}
                  <td className="border border-border px-2 py-1 font-medium text-center sticky left-0 bg-card z-10 whitespace-nowrap">
                    {new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>

                  {/* Station cells */}
                  {stations.map(station => {
                    const entry = entryMap[station.id]?.[day]
                    const lowStock = (entry?.stock ?? null) !== null && (entry?.stock ?? Infinity) < lowStockThreshold
                    return (
                      <React.Fragment key={station.id}>
                        <td className="border border-border p-0">
                          <MatrixCell value={entry?.consumption} onSave={val => handleSave(day, station.id, 'consumption', val)} />
                        </td>
                        <td className="border border-border p-0">
                          <MatrixCell value={entry?.stock} onSave={val => handleSave(day, station.id, 'stock', val)} highlight={lowStock} />
                        </td>
                      </React.Fragment>
                    )
                  })}

                  {/* Daily totals */}
                  <td className="border border-border px-2 py-1 text-center font-semibold tabular-nums bg-primary/5 text-primary">
                    {rowTotals[day]?.consumption > 0 ? rowTotals[day].consumption.toLocaleString() : '—'}
                  </td>
                  <td className="border border-border px-2 py-1 text-center font-semibold tabular-nums bg-primary/5 text-primary">
                    {rowTotals[day]?.stock > 0 ? rowTotals[day].stock.toLocaleString() : '—'}
                  </td>

                  {/* Remarks */}
                  <td className="border border-border p-0">
                    <input type="text"
                      defaultValue={stations.map(s => entryMap[s.id]?.[day]).find(e => e?.remarks)?.remarks || ''}
                      onBlur={e => {
                        if (stations[0]) {
                          const existing = entryMap[stations[0].id]?.[day]
                          upsertMutation.mutate({
                            date: new Date(year, month - 1, day),
                            stationId: stations[0].id,
                            consumption: existing?.consumption ?? null,
                            stock: existing?.stock ?? null,
                            remarks: e.target.value || undefined,
                          })
                        }
                      }}
                      className="w-full min-w-[120px] h-7 px-2 text-xs bg-transparent border-0 focus:outline-none focus:bg-primary/5 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Monthly totals footer */}
            <tfoot>
              <tr className="bg-secondary font-semibold">
                <td className="border border-border px-2 py-2 text-center sticky left-0 bg-secondary z-10">TOTAL</td>
                {stations.map(station => (
                  <React.Fragment key={station.id}>
                    <td className="border border-border px-2 py-2 text-center tabular-nums">
                      {colTotals[station.id]?.consumption.toLocaleString() || '—'}
                    </td>
                    <td className="border border-border px-2 py-2 text-center tabular-nums">
                      {colTotals[station.id]?.stock.toLocaleString() || '—'}
                    </td>
                  </React.Fragment>
                ))}
                <td className="border border-border px-2 py-2 text-center tabular-nums bg-primary/10 text-primary">
                  {Object.values(colTotals).reduce((s, v) => s + (v.consumption || 0), 0).toLocaleString()}
                </td>
                <td className="border border-border px-2 py-2 text-center tabular-nums bg-primary/10 text-primary">
                  {Object.values(colTotals).reduce((s, v) => s + (v.stock || 0), 0).toLocaleString()}
                </td>
                <td className="border border-border" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
