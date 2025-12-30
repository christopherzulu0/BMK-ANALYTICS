"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Plus, Search, Shield, Star } from "lucide-react"

const templates = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all resources and settings",
    permissions: 42,
    popular: true,
    category: "System",
  },
  {
    id: "finance-manager",
    name: "Finance Manager",
    description: "Manage financial transactions, reports, and settings",
    permissions: 28,
    popular: true,
    category: "Finance",
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    description: "View financial data and generate reports",
    permissions: 18,
    popular: false,
    category: "Finance",
  },
  {
    id: "payment-processor",
    name: "Payment Processor",
    description: "Process payments and manage payment settings",
    permissions: 15,
    popular: false,
    category: "Finance",
  },
  {
    id: "user-manager",
    name: "User Manager",
    description: "Manage users and their permissions",
    permissions: 12,
    popular: false,
    category: "System",
  },
  {
    id: "report-viewer",
    name: "Report Viewer",
    description: "View reports and dashboards",
    permissions: 8,
    popular: false,
    category: "Analytics",
  },
  {
    id: "auditor",
    name: "Auditor",
    description: "View audit logs and system activity",
    permissions: 10,
    popular: false,
    category: "Compliance",
  },
  {
    id: "compliance-officer",
    name: "Compliance Officer",
    description: "Manage compliance settings and reports",
    permissions: 22,
    popular: true,
    category: "Compliance",
  },
]

export function PermissionTemplates() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(templates.map((template) => template.category)))

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="w-full sm:w-[300px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? "bg-primary text-primary-foreground" : ""}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.popular && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> Popular
                  </Badge>
                )}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{template.permissions} permissions</span>
              </div>
              <Badge variant="outline" className="mt-2">
                {template.category}
              </Badge>
            </CardContent>
            <CardFooter className="flex justify-between mt-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>{template.name}</DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="mb-4 text-sm font-medium">Included Permissions</h4>
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Dashboard</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="view-dashboard" checked disabled />
                              <label htmlFor="view-dashboard" className="text-sm">
                                View Dashboard
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="edit-dashboard" checked disabled />
                              <label htmlFor="edit-dashboard" className="text-sm">
                                Edit Dashboard
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Transactions</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="view-transactions" checked disabled />
                              <label htmlFor="view-transactions" className="text-sm">
                                View Transactions
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="create-transactions" checked disabled />
                              <label htmlFor="create-transactions" className="text-sm">
                                Create Transactions
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="approve-transactions" checked disabled />
                              <label htmlFor="approve-transactions" className="text-sm">
                                Approve Transactions
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Reports</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="view-reports" checked disabled />
                              <label htmlFor="view-reports" className="text-sm">
                                View Reports
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="create-reports" checked disabled />
                              <label htmlFor="create-reports" className="text-sm">
                                Create Reports
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Settings</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="view-settings" checked disabled />
                              <label htmlFor="view-settings" className="text-sm">
                                View Settings
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="edit-settings" checked={template.id === "admin"} disabled />
                              <label htmlFor="edit-settings" className="text-sm">
                                Edit Settings
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Role
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Apply Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button>Apply</Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="flex flex-col items-center justify-center p-6 border-dashed">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">Create Custom Template</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Build a custom permission template for your specific needs
          </p>
          <Button>Create Template</Button>
        </Card>
      </div>
    </div>
  )
}

