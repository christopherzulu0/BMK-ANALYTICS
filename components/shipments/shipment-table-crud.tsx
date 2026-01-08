"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useShipments, type Shipment } from "./shipment-context"
import { ShipmentFormModal } from "./shipment-form-modal"

const ITEMS_PER_PAGE = 10

export function ShipmentTableCRUD() {
  const { shipments, addShipment, updateShipment, deleteShipment } = useShipments()
  const [formOpen, setFormOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<Shipment | undefined>()
  const [currentPage, setCurrentPage] = useState(1)

  const handleCreate = (data: Omit<Shipment, "id">) => {
    addShipment(data)
  }

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment)
    setFormOpen(true)
  }

  const handleUpdate = (data: Omit<Shipment, "id">) => {
    if (editingShipment) {
      updateShipment(editingShipment.id, data)
      setEditingShipment(undefined)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      deleteShipment(id)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_TRANSIT: "bg-blue-100 text-blue-800",
      DISCHARGED: "bg-green-100 text-green-800",
      DELAYED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const totalPages = Math.ceil(shipments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedShipments = shipments.slice(startIndex, endIndex)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Shipment Management</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Create, edit, and delete shipments</p>
          </div>
          <Button
            onClick={() => {
              setEditingShipment(undefined)
              setFormOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Shipment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Vessel</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Destination</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Cargo (MT)</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Progress</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{shipment.vessel}</td>
                    <td className="py-3 px-4 text-sm">{shipment.supplier}</td>
                    <td className="py-3 px-4 text-sm">{shipment.destination}</td>
                    <td className="py-3 px-4 text-sm">{shipment.cargo}</td>
                    <td className="py-3 px-4 text-sm">
                      <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${shipment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{shipment.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(shipment)} className="gap-1">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(shipment.id)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, shipments.length)} of {shipments.length} shipments
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
        </CardContent>
      </Card>

      <ShipmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        shipment={editingShipment}
        onSubmit={editingShipment ? handleUpdate : handleCreate}
        mode={editingShipment ? "edit" : "create"}
      />
    </>
  )
}
