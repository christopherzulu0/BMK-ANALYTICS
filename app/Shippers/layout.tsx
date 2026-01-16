import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ShipmentProvider } from "@/components/shipments/shipment-context"



export const metadata: Metadata = {
  title: "Shipments Dashboard - Real-time Cargo Tracking",
  description: "Monitor and track shipments in real-time with advanced logistics analytics",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function ShippersLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ShipmentProvider>
      <div className="font-sans antialiased">
        {children}
        <Analytics />
      </div>
    </ShipmentProvider>
  )
}
