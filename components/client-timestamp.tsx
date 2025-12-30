"use client"

import { useEffect, useState } from "react"

interface ClientTimestampProps {
  timestamp: Date
}

export function ClientTimestamp({ timestamp }: ClientTimestampProps) {
  const [formattedTime, setFormattedTime] = useState<string>("")

  useEffect(() => {
    // Only run the formatting on the client side
    const formatTimestamp = (timestamp: Date) => {
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
      } else {
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) {
          return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
        } else {
          return timestamp.toLocaleDateString()
        }
      }
    }

    setFormattedTime(formatTimestamp(timestamp))

    // Optional: Update the time periodically
    const intervalId = setInterval(() => {
      setFormattedTime(formatTimestamp(timestamp))
    }, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [timestamp])

  // Return empty string during server-side rendering
  // This prevents hydration mismatch
  if (!formattedTime) {
    return null
  }

  return <span className="text-xs text-muted-foreground">{formattedTime}</span>
}
