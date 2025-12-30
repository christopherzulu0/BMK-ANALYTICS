import { Button } from "@/components/ui/button"
import { Shield, Download, Upload, HelpCircle, Bell } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PageHeader() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
              <p className="text-sm text-muted-foreground">Manage access control across your organization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent Activity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Role Update</Badge>
                      <span className="text-xs text-muted-foreground">2 minutes ago</span>
                    </div>
                    <p className="text-sm">Alex Johnson updated the Finance Manager role permissions</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">New User</Badge>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <p className="text-sm">Sarah Williams was assigned the Accountant role</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Permission Revoked</Badge>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                    <p className="text-sm">Delete Invoices permission was revoked from Member Manager role</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium">View All Notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p>
                  Manage user roles and permissions across the platform. Control who can access what features and data.
                </p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Roles (CSV)</DropdownMenuItem>
                <DropdownMenuItem>Export Permissions (CSV)</DropdownMenuItem>
                <DropdownMenuItem>Export Audit Logs (CSV)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Export All Data (JSON)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

