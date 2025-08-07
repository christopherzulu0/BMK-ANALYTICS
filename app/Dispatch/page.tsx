'use client'

import React,{ useEffect, useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardWidgets } from "@/components/dashboard-widgets"
import type { Metadata } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { AlertTriangle } from "lucide-react"
import { Mail } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

 const metadata: Metadata = {
  title: "Pipeline Operations Dashboard",
  description: "Advanced monitoring and management of dispatch operations",
}

export default  function DashboardPage() {
 

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      {/*<DashboardHeader />*/}
      <DashboardShell>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Dispatch Operations</h2>
            <p className="text-muted-foreground">Real-time monitoring and management of dispatch operations</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Link
              href="/Dispatch/reports"
              className="w-full sm:w-auto inline-flex h-9 items-center justify-center rounded-md bg-primary/10 text-primary px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              View Reports
            </Link>
            {/*<Link*/}
            {/*  href="/Dispatch/shipments/new"*/}
            {/*  className="w-full sm:w-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"*/}
            {/*>*/}
            {/*  Add Shipment*/}
            {/*</Link>*/}
          </div>
        </div>
        <DashboardWidgets />
      </DashboardShell>
    </div>
  )
}
