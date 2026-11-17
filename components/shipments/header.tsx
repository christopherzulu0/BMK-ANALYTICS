"use client"

import { Bell, Filter, Search, Settings, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ShipmentsHeader() {
  return (
    <header className="border-b border-border bg-gradient-to-r from-card to-card/50 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center justify-between p-6 lg:p-8">
        <div>
          <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Shipments Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Real-time intelligence • Predictive analytics • Supply chain optimization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 bg-secondary/30 hover:bg-secondary/60 border-border/50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shipments..."
              className="pl-10 w-64 bg-background border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 bg-secondary/30 hover:bg-secondary/60 border-border/50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 bg-secondary/30 hover:bg-secondary/60 border-border/50 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            className="relative gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-300"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full animate-pulse" />
          </Button>
        </div>
      </div>
    </header>
  )
}
