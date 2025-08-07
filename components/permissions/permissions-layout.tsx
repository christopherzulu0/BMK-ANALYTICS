"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesManagement } from "./roles-management"
import { UserPermissions } from "./user-permissions"
import { PermissionMatrix } from "./permission-matrix"
import { AuditLogs } from "./audit-logs"
import { PermissionSettings } from "./permission-settings"
import { PermissionTemplates } from "./permission-templates"
import { PermissionAnalytics } from "./permission-analytics"
import { PageHeader } from "./page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, ShieldCheck, Grid3X3, ClipboardList, Settings, FileText, BarChart3, Moon, Sun } from "lucide-react"
import { motion } from "@/components/ui/motion"

export default function PermissionsLayout() {
  const [activeTab, setActiveTab] = useState("roles")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { toast } = useToast()

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")

    toast({
      title: isDarkMode ? "Light mode enabled" : "Dark mode enabled",
      description: "Your preference has been saved.",
      duration: 2000,
    })
  }

  // Set initial dark mode based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)
    if (prefersDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <div className={`container mx-auto py-6 space-y-8 transition-colors duration-200 ${isDarkMode ? "dark" : ""}`}>
      <div className="flex justify-between items-center">
        <PageHeader />
        <Button variant="outline" size="icon" onClick={toggleDarkMode} className="h-10 w-10">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="p-1 overflow-hidden">
        <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full h-auto p-1 bg-muted/50">
            <TabsTrigger value="roles" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2 py-3">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2 py-3">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="px-4 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="roles" className="space-y-6 mt-0">
                <RolesManagement />
              </TabsContent>

              <TabsContent value="users" className="space-y-6 mt-0">
                <UserPermissions />
              </TabsContent>

              <TabsContent value="matrix" className="space-y-6 mt-0">
                <PermissionMatrix />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6 mt-0">
                <PermissionTemplates />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <PermissionAnalytics />
              </TabsContent>

              <TabsContent value="audit" className="space-y-6 mt-0">
                <AuditLogs />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <PermissionSettings />
              </TabsContent>
            </motion.div>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

