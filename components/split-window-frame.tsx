"use client"

import { useState, useRef } from "react"
import { ChevronRight, RefreshCw, Maximize2 } from "lucide-react"

interface Window {
  id: number
  title: string
  route: string
}

export default function SplitWindowFrame({
  window,
  onUpdate,
}: {
  window: Window
  onUpdate: (id: number, route: string, title: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputRoute, setInputRoute] = useState(window.route)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleSubmit = () => {
    onUpdate(window.id, inputRoute, inputRoute.split("/").pop() || "Page")
    setIsEditing(false)
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-2xl hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputRoute}
                onChange={(e) => setInputRoute(e.target.value)}
                placeholder="/route"
                className="flex-1 px-3 py-1 rounded bg-slate-900 text-white text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                  if (e.key === "Escape") setIsEditing(false)
                }}
              />
              <button
                onClick={handleSubmit}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{window.title}</span>
              <span className="text-xs text-slate-400 font-mono">{window.route}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
            title="Edit route"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Frame */}
      <div className="flex-1 bg-slate-950 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={window.route}
          className="w-full h-full border-none"
          title={window.title}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
