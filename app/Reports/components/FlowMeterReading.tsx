'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { CalendarIcon, Download, BarChart2, Table2, ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ReadingsData } from '@/types/readingsData'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { convertToCSV } from './ReadingComponents/utils'

interface FlowMeterReadings {
  data: ReadingsData[]
}

const columnHelper = createColumnHelper<ReadingsData>()

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => format(parseISO(info.getValue()), 'yyyy-MM-dd HH:mm'),
  }),
  columnHelper.accessor('lineNo', {
    header: 'Line No',
  }),
  columnHelper.accessor('reading', {
    header: 'Reading',
  }),
  columnHelper.accessor('flowMeter1', {
    header: 'Flow Meter 1',
  }),
  columnHelper.accessor('flowMeter2', {
    header: 'Flow Meter 2',
  }),
]

export default function FlowMeterReading({ data = [] }: FlowMeterReadings) {
  const [readingLineData, setReadingLineData] = useState<ReadingsData[]>(data)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })
  const [showChart, setShowChart] = useState(true)

  useEffect(() => {
    console.log('Initial data received:', data)
    setReadingLineData(data)
  }, [data])

  const filteredData = useMemo(() => {
    console.log('Filtering data with date range:', dateRange)
    if (!dateRange?.from || !dateRange?.to) return readingLineData

    return readingLineData.filter(item => {
      const itemDate = parseISO(item.date)
      const isWithinRange = isWithinInterval(itemDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
      console.log('Item:', item, 'Is within range:', isWithinRange)
      return isWithinRange
    })
  }, [readingLineData, dateRange])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  const handleExport = () => {
    const csv = convertToCSV(filteredData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'flow_meter_readings.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    const printContent = document.createElement('div')
    printContent.className = 'print-content'

    // Clone the table header
    const tableHeader = document.querySelector('.print-section table thead')?.cloneNode(true)

    // Clone only the current page rows
    const tableBody = document.createElement('tbody')
    table.getRowModel().rows.forEach((row) => {
      const clonedRow = row.getVisibleCells()[0].row.getElement().cloneNode(true)
      tableBody.appendChild(clonedRow)
    })

    // Create a new table with the header and current page body
    const tableElement = document.createElement('table')
    tableElement.appendChild(tableHeader as Node)
    tableElement.appendChild(tableBody)

    printContent.appendChild(tableElement)

    const style = document.createElement('style')
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `
    printContent.appendChild(style)

    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    windowPrint?.document.body.appendChild(printContent)
    windowPrint?.document.close()
    windowPrint?.focus()
    windowPrint?.print()
    windowPrint?.close()
  }

  console.log('Render: showChart =', showChart, 'filteredData length =', filteredData.length)

  return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">FlowMeter Reading</h2>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                      dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                      ) : (
                          format(dateRange.from, "LLL dd, y")
                      )
                  ) : (
                      <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(newDateRange) => {
                      console.log('New date range selected:', newDateRange)
                      setDateRange(newDateRange)
                    }}
                    numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center space-x-2">
              <Switch
                  id="chart-mode-flowMeter"
                  checked={showChart}
                  onCheckedChange={(checked) => {
                    console.log('Chart mode changed to:', checked)
                    setShowChart(checked)
                  }}
              />
              <Label htmlFor="chart-mode-flowMeter">{showChart ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}</Label>
            </div>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        <Card className="print-section">
          <CardHeader>
            <CardTitle>Flow Meter Readings</CardTitle>
            <CardDescription>
              Hourly flow meter readings for different lines
              {dateRange?.from && dateRange?.to && (
                  <span className="block mt-2">
                Date Range: {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
              </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length > 0 ? (
                showChart ? (
                    <ChartContainer config={{
                      flowMeter1: {
                        label: "Flow Meter 1",
                        color: "hsl(var(--chart-1))",
                      },
                      flowMeter2: {
                        label: "Flow Meter 2",
                        color: "hsl(var(--chart-2))",
                      },
                    }} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                              dataKey="reading"
                              tickFormatter={(value) => value}
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="flowMeter1"
                              stroke="var(--color-flowMeter1)"
                              name="Flow Meter 1"
                          />
                          <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="flowMeter2"
                              stroke="var(--color-flowMeter2)"
                              name="Flow Meter 2"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                      {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                      )}
                                    </TableHead>
                                ))}
                              </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows.map((row) => (
                              <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                      )}
                                    </TableCell>
                                ))}
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="flex items-center justify-between px-4 py-4 border-t no-print">
                        <div className="flex-1 text-sm text-muted-foreground">
                          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of {filteredData.length} entries
                        </div>
                        <div className="flex items-center space-x-6 lg:space-x-8">
                          <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                )
            ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">No data available for the selected date range.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
