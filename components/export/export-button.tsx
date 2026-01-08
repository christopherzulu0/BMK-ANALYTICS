"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface ExportData {
  dailyEntry: any
  tanks: any[]
  remarks: any[]
}

interface ExportButtonProps {
  data: ExportData
  format: "csv" | "json"
}

export function ExportButton({ data, format }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const exportCSV = () => {
    const rows = []

    // Daily Entry Section
    rows.push("DAILY ENTRY ANALYSIS")
    rows.push("")
    rows.push(`Tfarm Discharge (m³),${data.dailyEntry.tfarmDischargeM3}`)
    rows.push(`Kigamboni Discharge (m³),${data.dailyEntry.kigamboniDischargeM3}`)
    rows.push(`Net Delivery @20C (m³),${data.dailyEntry.netDeliveryM3At20C}`)
    rows.push(`Net Delivery (MT),${data.dailyEntry.netDeliveryMT}`)
    rows.push("")

    // Tank Readings Section
    rows.push("TANK READINGS")
    rows.push("Tank,Status,Level (mm),Volume (m³),Water (cm),SG,Temp (°C),Vol@20°C (m³),MTS")
    data.tanks.forEach((tank) => {
      rows.push(
        `${tank.name},${tank.status},${tank.levelMm},${tank.volumeM3 || ""},${tank.waterCm || ""},${tank.sg || ""},${tank.tempC || ""},${tank.volAt20C || ""},${tank.mts || ""}`,
      )
    })
    rows.push("")

    // Remarks Section
    rows.push("REMARKS")
    rows.push("Position,Text")
    data.remarks.forEach((remark) => {
      rows.push(`${remark.position},"${remark.text.replace(/"/g, '""')}"`)
    })

    const csv = rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dailyEntry: data.dailyEntry,
      tanks: data.tanks,
      remarks: data.remarks,
    }

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      if (format === "csv") {
        exportCSV()
      } else {
        exportJSON()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export {format.toUpperCase()}
    </Button>
  )
}
