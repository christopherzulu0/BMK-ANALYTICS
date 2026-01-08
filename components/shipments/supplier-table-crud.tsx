"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useShipments } from "./shipment-context"
import { SupplierFormModal } from "./supplier-form-modal"
import { Star, Mail, Phone, MapPin, Trash2, Edit2, Plus, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 6

export function SupplierTableCRUD() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useShipments()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selectedSupplier, setSelectedSupplier] = useState<any>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const handleCreate = () => {
    setMode("create")
    setSelectedSupplier(undefined)
    setOpen(true)
  }

  const handleEdit = (supplier: any) => {
    setMode("edit")
    setSelectedSupplier(supplier)
    setOpen(true)
  }

  const handleSubmit = (data: any) => {
    if (mode === "create") {
      addSupplier(data)
    } else if (selectedSupplier) {
      updateSupplier(selectedSupplier.id, data)
    }
  }

  const totalPages = Math.ceil(suppliers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedSuppliers = suppliers.slice(startIndex, endIndex)

  return (
    <>
      <Card className="border-border/40 shadow-md">
        <CardHeader className="border-b border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Supplier Management</CardTitle>
              <CardDescription>Create, edit, and manage your suppliers</CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 border border-border/30 rounded-lg hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{supplier.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({supplier.reliability}% reliability)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)} className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSupplier(supplier.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active Shipments</span>
                  <span className="font-semibold text-sm text-primary">{supplier.activeShipments}</span>
                </div>
              </div>
            ))}
          </div>

          {suppliers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No suppliers yet. Create one to get started.</p>
            </div>
          )}

          {suppliers.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, suppliers.length)} of {suppliers.length} suppliers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-9"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierFormModal
        open={open}
        onOpenChange={setOpen}
        supplier={selectedSupplier}
        onSubmit={handleSubmit}
        mode={mode}
      />
    </>
  )
}
