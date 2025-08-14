"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  BarChart3,
  Users,
  Ship,
  AlertTriangle,
  Settings,
  Fuel,
  Activity,
  ChevronDown,
  Shield,
  ShieldCheck,
  Database,
  Wrench,
  FileText,
  LineChart as LineChartIcon,
  LayoutDashboard,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Menu items for the admin sidebar
const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  // {
  //   title: "Tank Management",
  //   icon: Fuel,
  //   id: "tanks",
  // },
  {
    title: "Pipeline Data",
    icon: Activity,
    id: "pipeline",
  },
  {
    title: "Shipments",
    icon: FileText,
    id: "shipments",
  },
  {
    title: "Permissions",
    icon: ShieldCheck,
    id: "permissions",
  },
  // {
  //   title: "Analytics",
  //   icon: LineChartIcon,
  //   id: "analytics",
  // },
  {
    title: "Upload Metrics",
    icon: Database,
    id: "metrics",
  },
  {
    title: "Upload Readings",
    icon: FileText,
    id: "readings",
  },
]

export function AdminSidebar({
  activeSection,
  setActiveSection,
}: {
  activeSection: string;
  setActiveSection: (section: string) => void
}) {
  const [unreadAlerts] = useState(3)
  const { data: session, status } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Sidebar
      className={`h-full min-h-screen border-r bg-gradient-to-b from-primary/5 to-white shadow-lg flex flex-col sticky top-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Admin sidebar navigation"
    >
      <SidebarHeader className="border-b px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-white relative">
        <div className="flex items-center gap-2">
          <img src="/favicon.ico" alt="Logo" className="h-8 w-8 rounded-lg shadow" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-primary">Tazama Admin</span>
              <span className="text-xs text-muted-foreground">v2.1.0</span>
            </div>
          )}
        </div>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/30 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-90' : '-rotate-90'}`} />
        </button>
      </SidebarHeader>
      <SidebarContent className="flex-1 px-2 py-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className={`uppercase text-xs text-muted-foreground font-semibold mb-2 tracking-wider ${collapsed ? 'sr-only' : ''}`}>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          isActive={activeSection === item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${activeSection === item.id ? 'bg-primary/10 border-l-4 border-primary text-primary font-semibold shadow' : 'hover:bg-muted/50'} ${collapsed ? 'justify-center' : ''}`}
                          aria-label={item.title}
                        >
                          <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                          {item.id === "alerts" && unreadAlerts > 0 && !collapsed && (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">
                              {unreadAlerts}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <div className="my-4 border-t" /> */}
      </SidebarContent>
      <SidebarFooter className="border-t bg-muted/30 px-4 py-3">
        <SidebarMenu>
          {status === "authenticated" && session?.user ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {session.user.name
                            ? `${session.user.name.split(' ')[0][0]}${session.user.name.split(' ')[1]?.[0] || ''}`
                            : session.user.email?.[0].toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {/* User status indicator */}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 animate-pulse" title="Online" />
                    </div>
                    {!collapsed && (
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium truncate max-w-[120px]">{session.user.name || session.user.email}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{session.user.role || "User"}</span>
                      </div>
                    )}
                    <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${collapsed ? 'rotate-90' : ''}`} />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => window.location.href = "/auth/signin"} className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                aria-label="Sign In"
              >
                <Users className="h-5 w-5" />
                {!collapsed && <span>Sign In</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-4 text-xs text-muted-foreground text-center w-full">
            &copy; {new Date().getFullYear()} Tazama Analytics
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
