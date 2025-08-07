"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function CsvUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setMessage(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setUploading(true)
    setMessage(null)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage(result.message)
    } catch (error) {
      console.error("Upload error:", error)
      setError(
          `Failed to upload file: ${(error as Error).message}. Please ensure you're uploading an XLSX file with the correct structure.`,
      )
    } finally {
      setUploading(false)
    }
  }

  return (
      <div className="w-full max-w-2xl mx-auto mt-10">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Import Metric Tons Data</CardTitle>
            <CardDescription className="text-gray-600">
              Upload your XLSX file to import pipeline data into the system
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div className="relative">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/50">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">Choose your XLSX file</p>
                  <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                </div>
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Selected File Display */}
              {file && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 truncate">{file.name}</p>
                        <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Uploading...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
            )}

            {/* Upload Button */}
            <Button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
              ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
              )}
            </Button>

            {/* Success Message */}
            {message && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">{message}</AlertDescription>
                </Alert>
            )}

            {/* Error Message */}
            {error && (
                <Alert className="border-red-200 bg-red-50" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Supported format: XLSX files only • Maximum file size: 10MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
