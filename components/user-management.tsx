"use client"

import React from "react"

import { useState } from "react"
import { useUsersData, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus, useBatchUpdateUserStatus, useBatchDeleteUsers, User } from "@/hooks/use-user-queries"
import { useRoleTypes, getRolePermissions } from "@/hooks/use-role-queries"
import { useQueryClient } from "@tanstack/react-query"
import {
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Download,
  Upload,
  Eye,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Grid3X3,
  List,
  Star,
  Shield,
  Activity,
  Settings,
  Phone,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Fallback mock data in case the API fails
const mockUserData: User[] = [
  {
    id: "U001",
    name: "John Smith",
    email: "john.smith@fuelmanagement.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
    department: "Operations",
    status: "active",
    lastLogin: "2024-01-10T14:30:00",
    createdAt: "2023-06-15T09:00:00",
    location: "Houston, TX",
    permissions: ["all"],
    avatar: "/placeholder.svg",
    loginCount: 1247,
    failedLogins: 0,
    twoFactorEnabled: true,
    sessionActive: true,
    notes: "Primary system administrator with full access privileges.",
    performance: 98,
    tasksCompleted: 156,
    lastActivity: "2024-01-10T14:25:00",
    timezone: "CST",
    preferredLanguage: "English",
    securityLevel: "high",
  },
  {
    id: "U002",
    name: "Sarah Johnson",
    email: "sarah.johnson@fuelmanagement.com",
    phone: "+1 (555) 234-5678",
    role: "Operations Manager",
    department: "Operations",
    status: "active",
    lastLogin: "2024-01-10T13:45:00",
    createdAt: "2023-08-22T10:30:00",
    location: "Dallas, TX",
    permissions: ["tanks", "pipeline", "shipments", "alerts"],
    avatar: "/placeholder.svg",
    loginCount: 892,
    failedLogins: 1,
    twoFactorEnabled: true,
    sessionActive: true,
    notes: "Responsible for daily operations and tank management.",
    performance: 94,
    tasksCompleted: 89,
    lastActivity: "2024-01-10T13:40:00",
    timezone: "CST",
    preferredLanguage: "English",
    securityLevel: "high",
  },
]

// Roles and permissions will be fetched from the API

const departments = ["IT","DISPATCH","DOE","RM"]
const locations = ["Head Office","BMK","Chinsali","Kalonje"]

function UserCard({ user, onEdit, onDelete, onToggleStatus }: any) {
  return (
    <Card className="hover:bg-gray-50 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {user.sessionActive && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {user.role === "Administrator" && <Crown className="h-4 w-4 text-yellow-500" />}
                {user.twoFactorEnabled && <Shield className="h-4 w-4 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={user.status === "active" ? "default" : user.status === "inactive" ? "secondary" : "outline-solid"}
              >
                {user.status}
              </Badge>
              {user.sessionActive && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Activity className="h-3 w-3" />
                  <span>Online</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{user.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{user.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Performance</p>
                <div className="flex items-center space-x-2">
                  <Progress value={user.performance} className="w-12 h-2" />
                  <span className="font-medium">{user.performance}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {user.lastLogin ? `Last login ${new Date(user.lastLogin).toLocaleDateString()}` : "Never logged in"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span>{user.loginCount} logins</span>
                {user.failedLogins > 0 && <span className="text-red-500">{user.failedLogins} failed</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                  {user.status === "active" ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserForm({ user, onSave, onCancel, roleNames, roleTypes }: any) {
  const [formData, setFormData] = useState(
    user || {
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      location: "",
      status: "active",
      twoFactorEnabled: false,
      notes: "",
      timezone: "CST",
      preferredLanguage: "English",
      securityLevel: "medium",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Get permissions for the selected role
  const rolePermissions = React.useMemo(() => {
    if (!roleTypes || !formData.role) return [];
    return getRolePermissions(formData.role, roleTypes);
  }, [roleTypes, formData.role]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          {/*<TabsTrigger value="permissions">Permissions</TabsTrigger>*/}
          {/*<TabsTrigger value="security">Security</TabsTrigger>*/}
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleNames.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the user..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Role-Based Permissions</h4>
            <p className="text-sm text-blue-700">
              Permissions are automatically assigned based on the selected role. Contact your administrator to modify
              role permissions.
            </p>
          </div>

          {formData.role && (
            <div className="space-y-3">
              <h4 className="font-medium">Assigned Permissions for {formData.role}:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rolePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 p-2 bg-green-50 rounded border">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 capitalize">{permission}</span>
                  </div>
                ))}
                {rolePermissions.length === 0 && (
                  <div className="col-span-3 p-4 text-center text-gray-500">
                    No permissions found for this role.
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="securityLevel">Security Level</Label>
              <Select
                value={formData.securityLevel}
                onValueChange={(value) => setFormData({ ...formData, securityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select security level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="CST">Central (CST)</SelectItem>
                  <SelectItem value="MST">Mountain (MST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 sm:space-y-0">
              <div className="space-y-1">
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-600">Add an extra layer of security to this account</p>
              </div>
              <Switch
                id="twoFactor"
                checked={formData.twoFactorEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked })}
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Security Recommendations</h4>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    <li>• Enable two-factor authentication for enhanced security</li>
                    <li>• Use strong passwords with at least 12 characters</li>
                    <li>• Regular password updates are recommended</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{user ? "Update User" : "Create User"}</Button>
      </div>
    </form>
  )
}

export function UserManagement() {
  // Fetch users data with React Query
  const { data: fetchedUsers, isLoading: isLoadingUsers, isError: isErrorUsers, error: userError } = useUsersData();

  // Fetch role types data with React Query
  const { data: roleTypes, isLoading: isLoadingRoles, isError: isErrorRoles, error: roleError } = useRoleTypes();

  // Use mutation hooks
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleUserStatusMutation = useToggleUserStatus();
  const batchUpdateUserStatusMutation = useBatchUpdateUserStatus();
  const batchDeleteUsersMutation = useBatchDeleteUsers();

  const queryClient = useQueryClient();

  // Use fetched data or fallback to mock data if there's an error
  const [users, setUsers] = useState<User[]>([]);

  // Update users state when data is fetched
  React.useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    } else if (isErrorUsers) {
      // Use mock data as fallback
      setUsers(mockUserData);
      console.error("Error fetching users:", userError);
    }
  }, [fetchedUsers, isErrorUsers, userError]);

  // Extract all role names from role types for the dropdown
  // Fallback to default roles if roleTypes is not available
  const roleNames = React.useMemo(() => {
    if (!roleTypes || roleTypes.length === 0) {
      // Fallback to some default roles if API fails
      return ["Administrator", "Operations Manager", "Maintenance Supervisor",
              "Safety Officer", "Analyst", "Operator", "Security Manager",
              "Logistics Coordinator"];
    }

    return roleTypes.flatMap(roleType =>
      roleType.roles.map(role => role.name)
    );
  }, [roleTypes]);

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter

    return matchesSearch && matchesStatus && matchesRole && matchesDepartment
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, roleFilter, departmentFilter])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = (user: User) => {
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => {
        // Optimistically update the UI
        setUsers(users.filter((u) => u.id !== user.id));
      },
      onError: (error) => {
        console.error("Error deleting user:", error);
        // Could add toast notification here
      }
    });
  }

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    toggleUserStatusMutation.mutate(
      { id: user.id, status: newStatus },
      {
        onSuccess: () => {
          // Optimistically update the UI
          setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
        },
        onError: (error) => {
          console.error("Error toggling user status:", error);
          // Could add toast notification here
        }
      }
    );
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      // Update existing user
      updateUserMutation.mutate(
        { id: editingUser.id, userData },
        {
          onSuccess: (updatedUser) => {
            // Optimistically update the UI
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)));
            setShowUserForm(false);
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          },
          onError: (error) => {
            console.error("Error updating user:", error);
            // Could add toast notification here
          }
        }
      );
    } else {
      // Create new user
      // Add required fields that aren't in the form
      const newUserData = {
        ...userData,
        permissions: roleTypes ? getRolePermissions(userData.role, roleTypes) : [],
      } as Omit<User, "id" | "createdAt" | "loginCount" | "failedLogins" | "sessionActive" | "performance" | "tasksCompleted" | "lastActivity">;

      createUserMutation.mutate(newUserData, {
        onSuccess: (newUser) => {
          // Optimistically update the UI
          const createdUser = {
            ...newUserData,
            id: newUser.id || `U${String(users.length + 1).padStart(3, "0")}`,
            createdAt: newUser.createdAt || new Date().toISOString(),
            lastLogin: null,
            loginCount: 0,
            failedLogins: 0,
            sessionActive: false,
            avatar: "/placeholder.svg",
            performance: 0,
            tasksCompleted: 0,
            lastActivity: null,
          } as User;

          setUsers([...users, createdUser]);
          setShowUserForm(false);
          setEditingUser(null);
        },
        onError: (error) => {
          console.error("Error creating user:", error);
          // Could add toast notification here
        }
      });
    }
  }

  const handleBulkAction = (action: string) => {
    if (action === "activate" || action === "deactivate") {
      const status = action === "activate" ? "active" : "inactive";

      batchUpdateUserStatusMutation.mutate(
        { userIds: selectedUsers, status },
        {
          onSuccess: () => {
            // Optimistically update the UI
            setUsers(users.map((u) => (selectedUsers.includes(u.id) ? { ...u, status } : u)));
            setSelectedUsers([]);
          },
          onError: (error) => {
            console.error(`Error ${action}ing users:`, error);
            // Could add toast notification here
          }
        }
      );
    } else if (action === "delete") {
      batchDeleteUsersMutation.mutate(selectedUsers, {
        onSuccess: () => {
          // Optimistically update the UI
          setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
        },
        onError: (error) => {
          console.error("Error deleting users:", error);
          // Could add toast notification here
        }
      });
    }
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
    online: users.filter((u) => u.sessionActive).length,
    avgPerformance: Math.round(users.reduce((acc, u) => acc + u.performance, 0) / users.length),
  }

  // Show loading state
  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading data...</h3>
          <p className="text-gray-500">Please wait while we fetch the necessary data.</p>
        </div>
      </div>
    );
  }

  // Handle error fetching roles
  if (isErrorRoles) {
    console.error("Error fetching role types:", roleError);
    // We can continue with the UI, but show a warning about roles
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage system users, roles, and permissions</p>
              </div>
            </div>
            {isErrorUsers && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                <p className="font-medium">Error loading users</p>
                <p>Using mock data as fallback. {userError?.message}</p>
              </div>
            )}
            {isErrorRoles && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm mt-2">
                <p className="font-medium">Error loading roles</p>
                <p>Some role-related functionality may be limited. {roleError?.message}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Update user information and permissions."
                      : "Create a new user account with appropriate permissions."}
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  user={editingUser}
                  roleNames={roleNames}
                  roleTypes={roleTypes}
                  onSave={handleSaveUser}
                  onCancel={() => {
                    setShowUserForm(false)
                    setEditingUser(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "cards" ? "default" : "outline-solid"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline-solid"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleNames.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setRoleFilter("all")
                  setDepartmentFilter("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filteredUsers.length} users found</span>
                <div className="flex items-center space-x-2">
                  <span>Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-blue-900">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                    {selectedUsers.length > paginatedUsers.length && (
                      <span className="text-sm text-blue-700 ml-1">(across multiple pages)</span>
                    )}
                  </span>
                  {selectedUsers.length > paginatedUsers.length && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])} className="text-xs">
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("activate")}
                    disabled={batchUpdateUserStatusMutation.isPending}
                  >
                    {batchUpdateUserStatusMutation.isPending && batchUpdateUserStatusMutation.variables?.status === "active" ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={batchUpdateUserStatusMutation.isPending}
                  >
                    {batchUpdateUserStatusMutation.isPending && batchUpdateUserStatusMutation.variables?.status === "inactive" ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                        Deactivating...
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={batchDeleteUsersMutation.isPending}
                      >
                        {batchDeleteUsersMutation.isPending ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedUsers.length} user
                          {selectedUsers.length > 1 ? "s" : ""}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleBulkAction("delete")}
                          disabled={batchDeleteUsersMutation.isPending}
                        >
                          {batchDeleteUsersMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          {paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...new Set([...selectedUsers, ...paginatedUsers.map((u) => u.id)])])
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => !paginatedUsers.map((u) => u.id).includes(id)),
                            )
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">Performance</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {user.sessionActive && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center space-x-1">
                              <span>{user.name}</span>
                              {user.role === "Administrator" && <Crown className="h-3 w-3 text-yellow-500" />}
                              {user.twoFactorEnabled && <Shield className="h-3 w-3 text-blue-500" />}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.department}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center space-x-2">
                          <Progress value={user.performance} className="w-16 h-2" />
                          <span className="text-sm">{user.performance}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "inactive"
                                  ? "secondary"
                                  : "outline-solid"
                            }
                          >
                            {user.status}
                          </Badge>
                          {user.sessionActive && <div className="h-2 w-2 bg-green-500 rounded-full" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              disabled={toggleUserStatusMutation.isPending}
                            >
                              {toggleUserStatusMutation.isPending && toggleUserStatusMutation.variables?.id === user.id ? (
                                <>
                                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                                  Updating...
                                </>
                              ) : user.status === "active" ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? (
                                <>
                                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(1)
                      }}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Current page and neighbors */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNumber > totalPages) return null

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNumber)
                      }}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {/* Last page */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(totalPages)
                      }}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" || roleFilter !== "all" || departmentFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding your first user."}
            </p>
            {!searchTerm && statusFilter === "all" && roleFilter === "all" && departmentFilter === "all" && (
              <Button onClick={() => setShowUserForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
