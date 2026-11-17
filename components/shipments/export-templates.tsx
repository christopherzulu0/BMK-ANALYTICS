"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Plus, Edit2, Trash2, Copy, Clock, Grid3x3 } from "lucide-react"

interface ExportTemplate {
  id: string
  name: string
  description: string
  format: string
  fields: string[]
  schedule?: string
  lastRun?: string
  createdBy: string
}

export function ExportTemplates() {
  const [templates, setTemplates] = useState<ExportTemplate[]>([
    {
      id: "1",
      name: "Daily Discharge Report",
      description: "Daily vessel discharge with volumes and reconciliation",
      format: "PDF",
      fields: ["vessel_name", "discharge_date", "total_volume", "status", "reconciliation"],
      schedule: "Daily 6:00 AM",
      lastRun: "Today 6:02 AM",
      createdBy: "Operations Team",
    },
    {
      id: "2",
      name: "Weekly KPI Summary",
      description: "Executive summary of weekly KPIs and alerts",
      format: "XLSX",
      fields: ["total_shipments", "on_time_rate", "volume_processed", "delays", "incidents"],
      schedule: "Weekly Monday 9:00 AM",
      lastRun: "2 days ago",
      createdBy: "Management",
    },
    {
      id: "3",
      name: "Supplier Performance Card",
      description: "Detailed supplier scorecard with ratings",
      format: "PDF",
      fields: ["supplier_name", "rating", "reliability", "compliance", "shipments_count"],
      createdBy: "Procurement",
    },
    {
      id: "4",
      name: "Compliance Audit Trail",
      description: "Full audit log for regulatory compliance",
      format: "CSV",
      fields: ["timestamp", "user", "action", "resource", "changes"],
      schedule: "Monthly 1st of month",
      createdBy: "Compliance",
    },
  ])

  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateFormat, setNewTemplateFormat] = useState("PDF")

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const handleDuplicate = (template: ExportTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
    }
    setTemplates([...templates, newTemplate])
  }

  const handleAddTemplate = () => {
    if (newTemplateName.trim()) {
      const template: ExportTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        description: "New template",
        format: newTemplateFormat,
        fields: [],
        createdBy: "Current User",
      }
      setTemplates([...templates, template])
      setNewTemplateName("")
      setNewTemplateFormat("PDF")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-balance bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Export Templates
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Create and manage custom export templates for automated reporting
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="e.g., Weekly Executive Report"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <div className="flex gap-2 mt-2">
                      {["PDF", "XLSX", "CSV", "JSON"].map((format) => (
                        <Button
                          key={format}
                          variant={newTemplateFormat === format ? "default" : "outline"}
                          onClick={() => setNewTemplateFormat(format)}
                          className="flex-1"
                        >
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddTemplate} className="w-full">
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group"
          >
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                    <Grid3x3 className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{template.format}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Created by:</span> {template.createdBy}
                  </p>
                  {template.schedule && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        <span className="font-medium">Schedule:</span> {template.schedule}
                      </span>
                    </p>
                  )}
                  {template.lastRun && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Last run:</span> {template.lastRun}
                    </p>
                  )}
                </div>

                {template.fields.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field) => (
                      <span key={field} className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-1 rounded">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 text-xs bg-transparent"
                  onClick={() => setEditingTemplate(template)}
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 text-xs bg-transparent"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-3 w-3" />
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1 text-xs bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => alert(`Exporting ${template.name}...`)}
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Export All", icon: Download },
              { label: "Schedule Report", icon: Clock },
              { label: "Email Template", icon: Download },
              { label: "Archive Templates", icon: Download },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="gap-2 border-border/50 hover:bg-secondary/30 bg-transparent"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
