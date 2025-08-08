"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, Ship, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"

// Function to fetch shipments data
const fetchShipments = async () => {
  const response = await fetch('/api/shipments')
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

export function RecentShipments() {
  // Fetch shipments data using React Query
  const { data: shipmentsData, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Process the shipments data
  const data = shipmentsData?.shipments || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-transit":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          >
            In Transit
          </Badge>
        )
      case "arriving":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
          >
            Arriving
          </Badge>
        )
      case "arrived":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
          >
            Arrived
          </Badge>
        )
      case "unloading":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
          >
            Unloading
          </Badge>
        )

        case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-purple-300 dark:border-purple-800"
          >
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSupplierAvatar = (supplier: string) => {
    const initials = supplier
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()

    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
      </Avatar>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="flex items-center justify-center h-[300px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="flex items-center justify-center h-[300px] text-red-500">
          <p>Error loading shipment data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <ScrollArea className="h-[300px] md:h-[350px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead className="hidden md:table-cell">Vessel ID</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cargo (MT)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              data.map((shipment) =>
              <TableRow key={shipment.id} className="group hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSupplierAvatar(shipment.supplier)}
                    <div>
                      <div className="font-medium">{shipment.supplier}</div>
                      <div className="text-xs text-muted-foreground md:hidden">ID: {shipment.vessel_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell font-medium">{shipment.vessel_id}</TableCell>
                <TableCell>{new Date(shipment.estimated_day_of_arrival).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(shipment.status)}
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          shipment.status === "arrived" || shipment.status === "unloading" || shipment.status === "completed"
                            ? "bg-green-500"
                            : shipment.status === "arriving"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{shipment.cargo_metric_tons.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ship className="mr-2 h-4 w-4" />
                          Track shipment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                        <DropdownMenuItem>Edit shipment</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
