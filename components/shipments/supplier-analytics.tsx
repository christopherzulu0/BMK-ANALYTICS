"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Star } from "lucide-react"

export function SupplierAnalytics() {
  const suppliers = [
    {
      name: "Global Trade Ltd",
      performance: 96,
      trend: "up",
      reliability: "99.2%",
      onTimeDelivery: "98%",
      documentAccuracy: "99.5%",
      totalShipments: 284,
      avgDelay: "0.2 days",
      rating: 4.9,
    },
    {
      name: "Pacific Logistics",
      performance: 87,
      trend: "down",
      reliability: "94.1%",
      onTimeDelivery: "91%",
      documentAccuracy: "96.2%",
      totalShipments: 156,
      avgDelay: "1.4 days",
      rating: 4.5,
    },
    {
      name: "Atlantic Shipping",
      performance: 73,
      trend: "down",
      reliability: "88.5%",
      onTimeDelivery: "82%",
      documentAccuracy: "91.8%",
      totalShipments: 98,
      avgDelay: "2.8 days",
      rating: 3.8,
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-accent" />
          Supplier Performance Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.name}
              className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{supplier.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(supplier.rating)
                            ? "fill-orange-accent text-orange-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{supplier.rating}/5.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{supplier.performance}%</span>
                  {supplier.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-green-accent" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-orange-accent" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">On-Time Rate</p>
                  <p className="font-semibold text-foreground">{supplier.onTimeDelivery}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Document Accuracy</p>
                  <p className="font-semibold text-foreground">{supplier.documentAccuracy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Shipments</p>
                  <p className="font-semibold text-foreground">{supplier.totalShipments}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Delay</p>
                  <p
                    className={`font-semibold ${supplier.avgDelay === "0.2 days" ? "text-green-accent" : "text-orange-accent"}`}
                  >
                    {supplier.avgDelay}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
