"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Download, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"
import axios from "axios"
import { toast } from "sonner"

interface Permission {
  id: number | string
  name: string
  description: string | null
}

interface GroupedPermissions {
  [key: string]: Permission[]
}

interface PermissionMatrixProps {
  initialPermissions?: string[]
  onPermissionsChange?: (permissions: string[]) => void
}

export function PermissionMatrix({ 
  initialPermissions = [], 
  onPermissionsChange 
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localPermissions, setLocalPermissions] = useState<string[]>(initialPermissions)
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  
  // Fetch permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/api/permissions")
        setGroupedPermissions(response.data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch permissions:", err)
        setError("Failed to load permissions. Please try again.")
        toast.error("Failed to load permissions")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPermissions()
  }, [])
  
  // Initialize local permissions only once
  useEffect(() => {
    if (initialPermissions && initialPermissions.length > 0) {
      setLocalPermissions(initialPermissions)
    }
  }, []) // Empty dependency array means this only runs once
  
  // Notify parent of changes, but debounced to prevent loops
  const handlePermissionChange = useCallback((permissionName: string) => {
    setLocalPermissions(prev => {
      const exists = prev.includes(permissionName)
      const newPermissions = exists
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
        
      // Use setTimeout to break the render cycle
      if (onPermissionsChange) {
        setTimeout(() => {
          onPermissionsChange(newPermissions)
        }, 0)
      }
      
      return newPermissions
    })
  }, [onPermissionsChange])

  // Filter permissions based on selected group and search query
  const filteredPermissions = useMemo(() => {
    if (!groupedPermissions) return {} as GroupedPermissions
    
    let filtered = { ...groupedPermissions }
    
    // Filter by selected group
    if (selectedGroup && selectedGroup !== "all") {
      filtered = {
        [selectedGroup]: filtered[selectedGroup] || []
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      Object.keys(filtered).forEach(group => {
        filtered[group] = (filtered[group] || []).filter(permission =>
          permission.name.toLowerCase().includes(query) ||
          (permission.description?.toLowerCase().includes(query) ?? false)
        )
      })
    }
    
    return filtered
  }, [groupedPermissions, selectedGroup, searchQuery])

  // Get unique groups from permissions
  const groups = useMemo(() => {
    if (!groupedPermissions) return []
    return Object.keys(groupedPermissions)
  }, [groupedPermissions])

  const handleExport = () => {
    try {
      const csv = Object.entries(filteredPermissions)
        .map(([group, perms]) => {
          return perms
            .map(p => `${group},${p.name},${p.description || ""}`)
            .join("\n")
        })
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "permissions.csv"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export permissions:", error)
      toast.error("Failed to export permissions")
    }
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[400px]">Loading permissions...</div>
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }
  
  if (groups.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p>No permissions found. Please check your permissions configuration.</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold">Permission Matrix</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search permissions..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Group</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Matrix
          </Button>
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[600px]">
            <div className="min-w-max">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[250px]">Permission</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="text-center min-w-[120px]">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(filteredPermissions).map(([group, perms]) => (
                    <React.Fragment key={group}>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={3} className="font-medium py-2">
                          {group}
                        </TableCell>
                      </TableRow>
                      {perms.map((permission) => (
                        <TableRow key={String(permission.id)}>
                          <TableCell className="flex items-center gap-2">
                            {permission.name}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="max-w-xs">Permission ID: {permission.id}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="text-muted-foreground">
                                  {permission.description || "No description"}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{permission.description || "No description available"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={localPermissions.includes(permission.name)}
                              onCheckedChange={() => handlePermissionChange(permission.name)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  )
}

