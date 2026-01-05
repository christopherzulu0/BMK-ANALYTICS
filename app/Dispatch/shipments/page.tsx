"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import * as XLSX from 'xlsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Download, Filter, MoreHorizontal, Plus, Search, Ship, FileText, Trash2, X, AlertTriangle, Mail } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddShipmentModal } from "@/components/add-shipment-modal"
import { ViewShipmentDetailsModal } from "@/components/view-shipment-details-modal"
import { UpdateShipmentStatusModal } from "@/components/update-shipment-status-modal"
import { EditShipmentModal } from "@/components/edit-shipment-modal"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useSession } from "next-auth/react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const [isDateRangeActive, setIsDateRangeActive] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const {data: session} = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission,setHasPermission] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(true);

  // Debounce search term to avoid filtering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Reset to first page when search term, filter, or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, dateRange]);

  // Show search loading indicator only when search term is actively changing
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Fetch shipments from API
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/shipments')

        if (!response.ok) {
          throw new Error('Failed to fetch shipments')
        }

        const data = await response.json()
        setShipments(data.shipments)
      } catch (error) {
        console.error('Error fetching shipments:', error)
        toast({
          title: "Error",
          description: "Failed to load shipments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  //Check user permissions

  useEffect(()=>{

    const checkPermission = async () => {
     try {
       const response = await fetch("/api/auth/check-permission", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           permission: "shipments.view"
         })
       })
 
       if (!response.ok) {
         throw new Error("Failed to check permission")
       }
 
       const data = await response.json()
       console.log("Permission check response:", data)
       setHasPermission(data.hasPermission)
     } catch (error) {
       console.error("Error checking permission:", error)
       setHasPermission(false)
     } finally {
       setIsLoading(false)
     }
   }
 
   checkPermission()
 
   },[session])
  //End of user permissions



  // Memoize filtered shipments to prevent unnecessary recalculations
  const filteredShipments = useMemo(() => {
    // Only filter if we have shipments
    if (!shipments.length) return [];

    // If no search term, filter, or date range, return all shipments
    if (!debouncedSearchTerm && statusFilter === "all" && !dateRange) return shipments;

    return shipments.filter((shipment) => {
      // Status filter check first (faster than string operations)
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      if (!matchesStatus) return false;

      // Date range filter check
      if (dateRange) {
        const shipmentDate = new Date(shipment.date);
        // Set time to midnight for accurate date comparison
        shipmentDate.setHours(0, 0, 0, 0);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // End of day

        if (shipmentDate < fromDate || shipmentDate > toDate) {
          return false;
        }
      }

      // If no search term, just check status and date range
      if (!debouncedSearchTerm) return true;

      // Convert search term to lowercase for case-insensitive comparison
      const searchTermLower = debouncedSearchTerm.toLowerCase();

      // Check the most commonly searched fields first for better performance
      if (shipment.vessel_id.toString().toLowerCase().includes(searchTermLower)) return true;
      if (shipment.supplier.toLowerCase().includes(searchTermLower)) return true;
      if (shipment.status.toLowerCase().includes(searchTermLower)) return true;

      // Check remaining fields only if necessary
      if (shipment.cargo_metric_tons.toString().toLowerCase().includes(searchTermLower)) return true;

      // Format dates for searching - only if needed
      const shipmentDate = new Date(shipment.date).toLocaleDateString().toLowerCase();
      if (shipmentDate.includes(searchTermLower)) return true;

      const etaDate = new Date(shipment.estimated_day_of_arrival).toLocaleDateString().toLowerCase();
      if (etaDate.includes(searchTermLower)) return true;

      // Check notes last as they might be null
      if (shipment.notes && shipment.notes.toLowerCase().includes(searchTermLower)) return true;

      return false;
    });
  }, [shipments, debouncedSearchTerm, statusFilter, dateRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentShipments = filteredShipments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
          >
            Scheduled
          </Badge>
        )
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
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
          >
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleAddShipment = async (newShipment: any) => {
    try {
      // Send the new shipment data to the API
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShipment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add shipment');
      }

      // Get the newly created shipment from the API response
      const data = await response.json();

      // Update the local state with the new shipment
      setShipments([data.shipment, ...shipments]);

      // Show success notification
      toast({
        title: "Shipment Added",
        description: `New shipment from ${newShipment.supplier} has been added successfully.`,
      });

      // Close the modal
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding shipment:', error);

      // Show error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shipment. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleUpdateShipmentStatus = async (id: number, status: string) => {
    try {
      // Send the update request to the API
      const response = await fetch('/api/shipments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipment status');
      }

      // Get the updated shipment from the API response
      const data = await response.json();

      // Update the local state with the updated shipment
      const updatedShipments = shipments.map((shipment) => {
        if (shipment.id === id) {
          return { ...shipment, status };
        }
        return shipment;
      });

      setShipments(updatedShipments);

      // Show success notification
      toast({
        title: "Status Updated",
        description: "The shipment status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating shipment status:', error);

      // Show error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update shipment status. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleEditShipment = async (id: number, updatedShipment: any) => {
    try {
      // Send the update request to the API
      const response = await fetch('/api/shipments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updatedShipment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipment');
      }

      // Get the updated shipment from the API response
      const data = await response.json();

      // Update the local state with the updated shipment
      const updatedShipments = shipments.map((shipment) => {
        if (shipment.id === id) {
          return { ...shipment, ...updatedShipment };
        }
        return shipment;
      });

      setShipments(updatedShipments);

      // Show success notification
      toast({
        title: "Shipment Updated",
        description: "The shipment has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating shipment:', error);

      // Show error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update shipment. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteShipment = async (id: number) => {
    try {
      // Send delete request to the API
      const response = await fetch(`/api/shipments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete shipment');
      }

      // Update the local state by removing the deleted shipment
      setShipments(shipments.filter((shipment) => shipment.id !== id));

      // Show success notification
      toast({
        title: "Shipment Deleted",
        description: "The shipment has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting shipment:', error);

      // Show error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete shipment. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Function to export shipments data to Excel
  const handleExportToExcel = () => {
    try {
      // Create a worksheet with formatted data
      const worksheet = XLSX.utils.json_to_sheet(
        filteredShipments.map(shipment => ({
          'Date': new Date(shipment.date).toLocaleDateString(),
          'Vessel ID': shipment.vessel_id,
          'Supplier': shipment.supplier,
          'Cargo (MT)': shipment.cargo_metric_tons,
          'Status': shipment.status,
          'ETA': new Date(shipment.estimated_day_of_arrival).toLocaleDateString(),
          'Notes': shipment.notes || '',
          'Progress': `${shipment.progress}%`
        }))
      );

      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');

      // Add metadata about filters
      let filename = 'Shipments_Export';

      // Add date range to filename if active
      if (dateRange) {
        const fromDate = new Date(dateRange.from).toLocaleDateString().replace(/\//g, '-');
        const toDate = new Date(dateRange.to).toLocaleDateString().replace(/\//g, '-');
        filename += `_${fromDate}_to_${toDate}`;
      }

      // Add status filter to filename if not "all"
      if (statusFilter !== 'all') {
        filename += `_${statusFilter}`;
      }

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `${filename}.xlsx`);

      // Show success notification
      toast({
        title: "Export Successful",
        description: "Shipments data has been exported to Excel.",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);

      // Show error notification
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel. Please try again.",
        variant: "destructive",
      });
    }
  }


  {/**If user has no response, display this message */}
  // if (!hasPermission) {
  //   return (
  //     <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
  //       <AlertDialogContent
  //         className="border-2 border-yellow-400 bg-yellow-50 rounded-2xl shadow-xl animate-fadeIn"
  //         aria-label="Permission Warning Dialog"
  //       >
  //         <AlertDialogHeader>
  //           <div className="flex items-center gap-3 mb-2">
  //             <AlertTriangle className="text-yellow-500 w-10 h-10 animate-pulse" />
  //             <AlertDialogTitle className="text-yellow-800 text-2xl font-extrabold">Not Permitted</AlertDialogTitle>
  //           </div>
  //           <div className="font-bold text-yellow-700 mb-1">Access Denied</div>
  //           <AlertDialogDescription className="text-yellow-900">
  //             You do not have permission to view this page. Please contact your administrator if you believe this is an error.
  //           </AlertDialogDescription>
  //           <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
  //             <span className="font-semibold">Why am I seeing this?</span> <br />
  //             For your security and to protect sensitive data, access to this page is restricted to authorized users only. If you need access, please reach out to your administrator.
  //           </div>
  //         </AlertDialogHeader>
  //         <AlertDialogFooter>
  //           <a
  //             href="mailto:Czulu@tazama.co.zm?subject=Access%20Request%20-%20Shipment%20Page"
  //             className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg shadow-sm hover:bg-yellow-500 focus:outline-hidden focus:ring-2 focus:ring-yellow-600 transition-colors"
  //             aria-label="Contact Administrator"
  //           >
  //             <Mail className="w-5 h-5" /> Contact Admin
  //           </a>
  //           <AlertDialogCancel className="ml-2">Close</AlertDialogCancel>
  //         </AlertDialogFooter>
  //       </AlertDialogContent>
  //     </AlertDialog>
  //   )
  // }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/*<DashboardHeader />*/}
      <DashboardShell>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Shipment Management</h1>
            <p className="text-muted-foreground">Track and manage all shipments in the pipeline</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`h-9 ${dateRange ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" : ""}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange ? (
                    <span>
                      {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                    </span>
                  ) : (
                    "Date Range"
                  )}
                  {dateRange && (
                    <X
                      className="ml-2 h-4 w-4 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange(undefined);
                        setIsDateRangeActive(false);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DateRangePicker
                  from={dateRange?.from}
                  to={dateRange?.to}
                  onSelect={(range) => {
                    setDateRange(range);
                    setIsDateRangeActive(!!range);
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="h-9" onClick={handleExportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="h-9" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xs flex-1">
          <CardContent className="p-4 space-y-4 h-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vessel ID, supplier, status, cargo, dates..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchLoading && (
                  <div className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="arriving">Arriving</SelectItem>
                    <SelectItem value="arrived">Arriving</SelectItem>
                    <SelectItem value="unloading">Unloading</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden flex-1">
              <ScrollArea className="h-full min-h-[400px] max-h-[calc(100vh-200px)]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vessel ID</TableHead>
                      <TableHead className="hidden md:table-cell">ETA</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="hidden md:table-cell">Cargo (MT)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>Loading shipments...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredShipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Ship className="h-8 w-8 mb-2 opacity-20" />
                            <p>No shipments found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentShipments.map((shipment) => (
                        <TableRow key={shipment.id} className="group">
                          <TableCell>{new Date(shipment.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{shipment.vessel_id}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(shipment.estimated_day_of_arrival).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              {shipment.supplier}
                              <div className="md:hidden text-xs text-muted-foreground">
                                ETA: {new Date(shipment.estimated_day_of_arrival).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {shipment.cargo_metric_tons.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedShipment(shipment);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedShipment(shipment);
                                    setIsUpdateStatusModalOpen(true);
                                  }}
                                >
                                  <Ship className="mr-2 h-4 w-4" />
                                  Update status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedShipment(shipment);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  Edit shipment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer"
                                  onClick={() => handleDeleteShipment(shipment.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete shipment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                {filteredShipments.length > 0 ? (
                  <>
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(endIndex, filteredShipments.length)}</span> of{" "}
                    <span className="font-medium">{filteredShipments.length}</span> shipments
                    {debouncedSearchTerm || statusFilter !== "all" || dateRange ? " (filtered)" : ""}
                  </>
                ) : (
                  <>
                    Showing <span className="font-medium">0</span> of{" "}
                    <span className="font-medium">{shipments.length}</span> shipments
                  </>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AddShipmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddShipment} />

        <ViewShipmentDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          shipment={selectedShipment}
        />

        <UpdateShipmentStatusModal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          shipment={selectedShipment}
          onUpdate={handleUpdateShipmentStatus}
        />

        <EditShipmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          shipment={selectedShipment}
          onUpdate={handleEditShipment}
        />
      </DashboardShell>
    </div>
  )
}
