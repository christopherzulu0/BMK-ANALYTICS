"use client"

import * as React from "react"
import { Activity, BarChart3, FileText, ChevronDown, Database, LineChart, Droplet, Scale } from "lucide-react"
import Link from "next/link"
import AuthStatus from "./AuthStatus"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"

export function AppSidebarDispatch() {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  

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
  //             href="mailto:Czulu@tazama.co.zm?subject=Access%20Request%20-%20Dispatch%20Page"
  //             className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg shadow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-colors"
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
      <Sidebar className="border-r">
        <SidebarHeader className="pb-6 border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="gap-4">
                <Link href="/">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                    <Activity className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold tracking-wide">Dispatch Ops</span>
                    <span className="text-xs font-medium text-muted-foreground">Operations Dashboard</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup className="pt-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              Pipeline Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
             

                <SidebarMenuItem>
                  <SidebarMenuButton
                 
                      onClick={() => toggleGroup("dispatch")}
                      className={`w-full justify-start ${openGroups["dispatch"] ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    <Database className="size-4" />
                    <span>Dispatch</span>
                    <ChevronDown
                        className={`ml-auto size-4 transition-transform duration-200 ${openGroups["dispatch"] ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                  {openGroups["dispatch"] && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          {/* <SidebarMenuSubButton asChild>
                            <Link href="/Dispatch" className="group">
                              <Database className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                              <span>Dashboard</span>
                            </Link>
                          </SidebarMenuSubButton> */}
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/Dispatch/shipments" className="group">
                              <FileText className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                              <span>Shipments</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/Dispatch/tankage" className="group">
                              <BarChart3 className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                              <span>Tankage</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>



        {/* Auth Status */}
        <div className="mt-auto p-4 border-t">
          <AuthStatus />
        </div>
      </Sidebar>
  )
}
