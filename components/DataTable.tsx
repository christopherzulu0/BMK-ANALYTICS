"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CSVLink } from "react-csv"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps {
  data: any[]
}

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCell, setEditingCell] = useState(null)
  const itemsPerPage = 10

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
    return 0
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [data, searchTerm])

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const handleCellEdit = async (rowIndex, columnName, newValue) => {
    const updatedItem = { ...currentItems[rowIndex], [columnName]: newValue }
    
    // Update the database
    await fetch('/api/updatePipelineData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    })

    // Update local state
    const newData = [...data]
    newData[rowIndex + indexOfFirstItem] = updatedItem
    setData
    (newData)
    setEditingCell(null)
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg shadow-sm">No data available for the selected date.</div>
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <CSVLink data={sortedData} filename={"pipeline_data.csv"}>
            <Button variant="outline">Export to CSV</Button>
          </CSVLink>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0] || {}).map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => requestSort(header)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {sortConfig?.key === header && (
                        sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr key={index} className={item.isAnomaly ? 'bg-red-50' : 'hover:bg-gray-50 transition-colors'}>
                  {Object.entries(item).map(([key, value]) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingCell === `${index}-${key}` ? (
                        <Input
                          value={value}
                          onChange={(e) => handleCellEdit(index, key, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="w-full"
                        />
                      ) : (
                        <div 
                          onClick={() => setEditingCell(`${index}-${key}`)}
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                          {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, sortedData.length)}</span> of{' '}
                <span className="font-medium">{sortedData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline-solid"}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-primary border-primary text-primary-foreground'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}