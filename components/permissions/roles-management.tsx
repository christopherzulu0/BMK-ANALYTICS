"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Copy, Users, ChevronRight, Shield, Clock, ArrowUpDown, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "@/components/ui/motion"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PermissionMatrix } from "./permission-matrix"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

// Add these types after the imports
type Role = {
  id: number
  name: string
  description: string
  userCount: number
  isSystem: boolean
  permissions: string[]
  lastModified: string
  timeRestrictions: TimeRestriction | null
}

// Add this type for time restrictions
type TimeRestriction = {
  enabled: boolean
  days: string[]
  startTime: string
  endTime: string
  startDate: string
  endDate: string
}

// Sample permission categories
// const permissionCategories = [
//   {
//     name: "Dashboard",
//     permissions: [
//       { id: "dashboard.view", name: "View Dashboard" },
//       { id: "dashboard.edit", name: "Edit Dashboard" },
//     ],
//   },
//   {
//     name: "Invoices",
//     permissions: [
//       { id: "invoices.view", name: "View Invoices" },
//       { id: "invoices.create", name: "Create Invoices" },
//       { id: "invoices.edit", name: "Edit Invoices" },
//       { id: "invoices.delete", name: "Delete Invoices" },
//     ],
//   },
//   {
//     name: "Transactions",
//     permissions: [
//       { id: "transactions.view", name: "View Transactions" },
//       { id: "transactions.create", name: "Create Transactions" },
//       { id: "transactions.edit", name: "Edit Transactions" },
//       { id: "transactions.delete", name: "Delete Transactions" },
//     ],
//   },
//   {
//     name: "Members",
//     permissions: [
//       { id: "members.view", name: "View Members" },
//       { id: "members.create", name: "Create Members" },
//       { id: "members.edit", name: "Edit Members" },
//       { id: "members.delete", name: "Delete Members" },
//     ],
//   },
// ]

export function RolesManagement() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
  const [isTimeRestrictionsOpen, setIsTimeRestrictionsOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({ name: "", description: "" })
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [timeRestrictions, setTimeRestrictions] = useState<TimeRestriction>({
    enabled: false,
    days: [],
    startTime: "09:00",
    endTime: "17:00",
    startDate: "",
    endDate: ""
  })

  // Update the effect to handle timeRestrictions properly
  useEffect(() => {
    if (currentRole?.timeRestrictions) {
      // If timeRestrictions is already an object, use it directly
      if (typeof currentRole.timeRestrictions === 'object') {
        setTimeRestrictions(currentRole.timeRestrictions)
      } else {
        // If it's a string, try to parse it
        try {
          const parsed = JSON.parse(currentRole.timeRestrictions)
          setTimeRestrictions(parsed)
        } catch (error) {
          console.error('Error parsing timeRestrictions:', error)
          // Reset to default if parsing fails
          setTimeRestrictions({
            enabled: false,
            days: [],
            startTime: "09:00",
            endTime: "17:00",
            startDate: "",
            endDate: ""
          })
        }
      }
    } else {
      // Reset to default if no timeRestrictions
      setTimeRestrictions({
        enabled: false,
        days: [],
        startTime: "09:00",
        endTime: "17:00",
        startDate: "",
        endDate: ""
      })
    }
  }, [currentRole])

  // Fetch roles
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/roles")
        console.log("API Response:", response.data)
        return response.data
      } catch (error) {
        console.error("Error fetching roles:", error)
        throw error
      }
    }
  })

  // Add error display
  if (error) {
    console.error("Query error:", error)
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Role Management</h2>
            <p className="text-muted-foreground">Create and manage roles to control access to features</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading roles. Please check your authentication and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await axios.post("/api/roles", roleData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setNewRole({ name: "", description: "" })
      setIsCreateOpen(false)
      toast({
        title: "Role created",
        description: "The role has been created successfully.",
        duration: 3000,
      })
    }
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await axios.put("/api/roles", roleData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsEditOpen(false)
      toast({
        title: "Role updated",
        description: "The role has been updated successfully.",
        duration: 3000,
      })
    }
  })

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      await axios.delete(`/api/roles?id=${roleId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsDeleteOpen(false)
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
        duration: 3000,
      })
    }
  })

  // Add duplicate role mutationF
  const duplicateRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      console.log("Sending role data to API:", roleData);
      const response = await axios.post("/api/roles", {
        ...roleData,
        name: `${roleData.name} (Copy)`,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      toast({
        title: "Role duplicated",
        description: "A copy of the role has been created successfully.",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error("Failed to duplicate role:", error);
      toast({
        title: "Error duplicating role",
        description: "There was a problem duplicating the role. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      name: newRole.name,
      description: newRole.description,
      permissions: []
    })
  }

  const handleEditRole = async () => {
    if (!currentRole) return;

    try {
      // Get all permissions to find IDs by name
      const permissionsResponse = await axios.get("/api/permissions");
      const allPermissions = permissionsResponse.data;

      // Extract all permission objects
      const permissionsList = Object.values(allPermissions).flat();

      // Find IDs for the selected permission names
      const permissionIds = currentRole.permissions
        .map((permName: string) => {
          const found = permissionsList.find((p: any) => p.name === permName);
          return found ? found.id : null;
        })
        .filter(id => id !== null);

      console.log("Permission IDs for update:", permissionIds);

      // Make the API call with the correct permission IDs
      updateRoleMutation.mutate({
        id: currentRole.id,
        name: currentRole.name,
        description: currentRole.description,
        permissions: permissionIds
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  const handleDeleteRole = () => {
    if (!currentRole) return
    deleteRoleMutation.mutate(currentRole.id)
  }

  const openEditDialog = (role: any) => {
    setCurrentRole({ ...role })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (role: any) => {
    setCurrentRole(role)
    setIsDeleteOpen(true)
  }

  const openPermissionsDialog = (role: any) => {
    setCurrentRole(role)
    setIsPermissionsOpen(true)
  }

  const openTimeRestrictionsDialog = (role: any) => {
    setCurrentRole(role)
    setIsTimeRestrictionsOpen(true)
  }

  // Update the duplicateRole function
  const duplicateRole = async (role: any) => {
    try {
      // Log for debugging
      console.log("Duplicating role:", role);
      console.log("Original permissions:", role.permissions);

      // Get all permissions to find IDs by name
      const permissionsResponse = await axios.get("/api/permissions");
      const allPermissions = permissionsResponse.data;

      // Extract all permission objects
      const permissionsList = Object.values(allPermissions).flat();

      // Find IDs for the permission names
      const permissionIds = role.permissions
        .map((permName: string) => {
          const found = permissionsList.find((p: any) => p.name === permName);
          return found ? found.id : null;
        })
        .filter((id: any) => id !== null);

      console.log("Permission IDs for duplicate:", permissionIds);

      // Make the API call with the correct permission IDs
      duplicateRoleMutation.mutate({
        name: role.name,
        description: role.description,
        permissions: permissionIds,
        isSystem: false
      });
    } catch (error) {
      console.error("Error duplicating role:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate role. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  // Sort and filter roles
  const filteredRoles = (roles as any[])
    .filter((role: any) =>
      (role.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (role.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortBy === "users") {
        return sortOrder === "asc" ? (a.userCount || 0) - (b.userCount || 0) : (b.userCount || 0) - (a.userCount || 0)
      } else if (sortBy === "permissions") {
        // Defensive: ensure permissions is always an array
        const aPerms = Array.isArray(a.permissions) ? a.permissions : [];
        const bPerms = Array.isArray(b.permissions) ? b.permissions : [];
        return sortOrder === "asc" ? aPerms.length - bPerms.length : bPerms.length - aPerms.length
      } else if (sortBy === "modified") {
        // Safely get timestamp or use 0 for invalid dates
        const getValidTimestamp = (dateStr: string | null | undefined) => {
          if (!dateStr) return 0;
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        };
        const aTime = getValidTimestamp(a.lastModified);
        const bTime = getValidTimestamp(b.lastModified);
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }
      return 0
    })

  // Update the handlePermissionUpdate function
  const handlePermissionUpdate = async (roleId: number, permissions: string[]) => {
    if (!currentRole) return;

    try {
      // First update the local state to show immediate feedback
      setCurrentRole(prev => prev ? {
        ...prev,
        permissions: permissions
      } : null)

      // Log for debugging
      console.log("Updating permissions for role:", roleId);
      console.log("Permission names to update:", permissions);

      // Get all permissions to find IDs by name
      const permissionsResponse = await axios.get("/api/permissions");
      const allPermissions = permissionsResponse.data;

      // Extract all permission objects
      const permissionsList = Object.values(allPermissions).flat();

      // Find IDs for the selected permission names
      const permissionIds = permissions
        .map(permName => {
          const found = permissionsList.find((p: any) => p.name === permName);
          return found ? found.id : null;
        })
        .filter(id => id !== null);

      console.log("Permission IDs to update:", permissionIds);

      // Then make the API call with the correct permission IDs
      const response: any = await axios.put("/api/roles", {
        id: roleId,
        name: currentRole.name,
        description: currentRole.description,
        permissions: permissionIds,
        timeRestrictions: currentRole.timeRestrictions
      });

      toast({
        title: "Permissions updated",
        description: "The role permissions have been updated successfully.",
        duration: 3000,
      })
      
      // Update the currentRole state with the response from the API
      setCurrentRole((prev: any) => prev ? {
        ...prev,
        permissions: Array.isArray(response.data.permissions)
          ? response.data.permissions.map((p: any) => p.name)
          : []
      } : null)

      // Invalidate the roles query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["roles"] })

      // Fetch the updated role and update currentRole
      try {
        const updatedRoleResponse = await axios.get(`/api/roles?id=${roleId}`);
        const updatedRole = updatedRoleResponse.data;
        setCurrentRole(prev => prev ? {
          ...prev,
          permissions: Array.isArray(updatedRole.permissions)
            ? updatedRole.permissions.map((p: any) => p.name)
            : []
        } : null);
      } catch (fetchError) {
        console.error("Error fetching updated role after permission update:", fetchError);
      }

    
    } catch (error) {
      console.error("Error updating permissions:", error);
      // Revert the local state on error
      setCurrentRole(prev => prev ? {
        ...prev,
        permissions: currentRole.permissions
      } : null)

      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Add time restriction handlers
  const handleTimeRestrictionUpdate = async () => {
    if (!currentRole) return;

    try {
      // Get all permissions to find IDs by name
      const permissionsResponse = await axios.get("/api/permissions");
      const allPermissions = permissionsResponse.data;

      // Extract all permission objects
      const permissionsList = Object.values(allPermissions).flat();

      // Find IDs for the selected permission names
      const permissionIds = currentRole.permissions
        .map((permName: string) => {
          const found = permissionsList.find((p: any) => p.name === permName);
          return found ? found.id : null;
        })
        .filter(id => id !== null);

      console.log("Permission IDs for time restriction update:", permissionIds);

      await updateRoleMutation.mutateAsync({
        id: currentRole.id,
        name: currentRole.name,
        description: currentRole.description,
        permissions: permissionIds,
        timeRestrictions
      });

      setIsTimeRestrictionsOpen(false);
      toast({
        title: "Time restrictions updated",
        description: "The role time restrictions have been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating time restrictions:", error);
      toast({
        title: "Error",
        description: "Failed to update time restrictions. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Role Management</h2>
          <p className="text-muted-foreground">Create and manage roles to control access to features</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new role with specific permissions for users.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="e.g., Project Manager"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Describe the role's responsibilities and access level"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="time-restricted">Time-restricted access</Label>
                        <p className="text-sm text-muted-foreground">Limit access to specific times or dates</p>
                      </div>
                      <Switch id="time-restricted" />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="inherit-permissions">Inherit permissions</Label>
                        <p className="text-sm text-muted-foreground">Inherit permissions from another role</p>
                      </div>
                      <Switch id="inherit-permissions" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role-priority">Role Priority</Label>
                      <Select>
                        <SelectTrigger id="role-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Determines which role takes precedence when a user has multiple roles
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => toggleSort("name")} className="flex items-center gap-1">
          Name
          {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleSort("users")} className="flex items-center gap-1">
          Users
          {sortBy === "users" && <ArrowUpDown className="h-3 w-3" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort("permissions")}
          className="flex items-center gap-1"
        >
          Permissions
          {sortBy === "permissions" && <ArrowUpDown className="h-3 w-3" />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleSort("modified")} className="flex items-center gap-1">
          Last Modified
          {sortBy === "modified" && <ArrowUpDown className="h-3 w-3" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role: any) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="secondary" className="ml-2">
                          System
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                    <div className="text-xs text-muted-foreground mt-1">Role Type: {role.roleTypeName}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(role)} disabled={role.isSystem}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateRole(role)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPermissionsDialog(role)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openTimeRestrictionsDialog(role)}>
                        <Clock className="mr-2 h-4 w-4" />
                        Time Restrictions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(role)}
                        disabled={role.isSystem}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-grow">
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{Array.isArray(role.users_rel) ? role.users_rel.length : 0} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{Array.isArray(role.permissions) ? role.permissions.length : 0} permissions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Modified: {formatDate(role.lastModified)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 border-t">
                <Button variant="ghost" size="sm" onClick={() => openPermissionsDialog(role)}>
                  View Permissions
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role details and description.</DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="py-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Deleting the "{currentRole.name}" role will remove it from all assigned users. Users with this role
                  will lose associated permissions.
                </AlertDescription>
              </Alert>
              {currentRole.userCount > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  This role is currently assigned to {currentRole.userCount} users. Consider reassigning these users to
                  another role before deletion.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Restrictions Dialog */}
      <Dialog open={isTimeRestrictionsOpen} onOpenChange={setIsTimeRestrictionsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Time Restrictions for {currentRole?.name}</DialogTitle>
            <DialogDescription>Set time-based access restrictions for this role.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="enable-time-restrictions">Enable time restrictions</Label>
                <p className="text-sm text-muted-foreground">Limit when users with this role can access the system</p>
              </div>
              <Switch
                id="enable-time-restrictions"
                checked={timeRestrictions.enabled}
                onCheckedChange={(checked) => setTimeRestrictions(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            {timeRestrictions.enabled && (
              <>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Days of the week</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <Badge
                          key={day}
                          variant={timeRestrictions.days.includes(day) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            setTimeRestrictions(prev => ({
                              ...prev,
                              days: prev.days.includes(day)
                                ? prev.days.filter(d => d !== day)
                                : [...prev.days, day]
                            }))
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        type="time"
                        id="start-time"
                        value={timeRestrictions.startTime}
                        onChange={(e) => setTimeRestrictions(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        type="time"
                        id="end-time"
                        value={timeRestrictions.endTime}
                        onChange={(e) => setTimeRestrictions(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Date Range (Optional)</Label>
                    <div className="flex gap-4">
                      <div className="grid gap-2 flex-1">
                        <Label htmlFor="start-date">Start Date</Label>
                        <div className="flex items-center">
                          <Input
                            type="date"
                            id="start-date"
                            value={timeRestrictions.startDate}
                            onChange={(e) => setTimeRestrictions(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                          <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="grid gap-2 flex-1">
                        <Label htmlFor="end-date">End Date</Label>
                        <div className="flex items-center">
                          <Input
                            type="date"
                            id="end-date"
                            value={timeRestrictions.endDate}
                            onChange={(e) => setTimeRestrictions(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                          <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeRestrictionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTimeRestrictionUpdate}>Save Restrictions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      {/* Debug log for currentRole in Edit Permissions Dialog */}
      {isPermissionsOpen && (
        <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Permissions for {currentRole?.name}</DialogTitle>
              <DialogDescription>Select the permissions this role should have access to.</DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto max-h-[60vh]">
              {(() => {
                const permissionNames = Array.isArray(currentRole?.permissions)
                  ? currentRole.permissions.map((p: any) => typeof p === 'string' ? p : p.name)
                  : [];
                return (
                  <PermissionMatrix
                    key={currentRole?.id + '-' + permissionNames.join(',')}
                    initialPermissions={permissionNames}
                    onPermissionsChange={(permissions) => {
                      if (currentRole) {
                        handlePermissionUpdate(currentRole.id, permissions);
                      }
                    }}
                  />
                );
              })()}
            </div>
            <DialogFooter className="mt-4 border-t pt-4">
              <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsPermissionsOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
