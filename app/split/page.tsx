"use client"

import { useState } from "react"
import SplitWindowFrame from "@/components/split-window-frame"

export default function SplitPage() {
  const [windows, setWindows] = useState([
    { id: 1, title: "Shippers", route: "/Shippers" },
    { id: 2, title: "Tank Analysis", route: "/Tanks/Analysis" },
    { id: 3, title: "FlowRate", route: "/FlowRate" },
    { id: 4, title: "Tankage", route: "/Tanks" },
  ])

  const updateWindow = (id: number, route: string, title: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, route, title } : w)))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Split View</h1>
        <p className="text-slate-400">Preview 4 pages simultaneously in a 2x2 grid layout</p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-6">
        {windows.map((window) => (
          <SplitWindowFrame key={window.id} window={window} onUpdate={updateWindow} />
        ))}
      </div>
    </main>
  )
}
