import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor, Ship, ShipIcon, TruckIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"

const colorStyles = {
  blue: {
    border: "border-l-4 border-l-blue-500 dark:border-l-blue-600",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    text: "text-blue-500 dark:text-blue-400",
  },
  amber: {
    border: "border-l-4 border-l-amber-500 dark:border-l-amber-600",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    text: "text-amber-500 dark:text-amber-400",
  },
  green: {
    border: "border-l-4 border-l-green-500 dark:border-l-green-600",
    bg: "bg-green-50/50 dark:bg-green-950/20",
    text: "text-green-500 dark:text-green-400",
  },
  purple: {
    border: "border-l-4 border-l-purple-500 dark:border-l-purple-600",
    bg: "bg-purple-50/50 dark:bg-purple-950/20",
    text: "text-purple-500 dark:text-purple-400",
  },
}

// Function to fetch shipments data
const fetchShipments = async () => {
  const response = await fetch('/api/shipments')
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

export function ShipmentOverview() {
  // Fetch shipments data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Calculate metrics from shipments data
  const calculateMetrics = () => {
    if (!data || !data.shipments) {
      return {
        activeShipments: 0,
        arrivingToday: 0,
        arrivingTodayCargo: 0,
        totalCargo: 0,
        suppliers: new Set(),
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const metrics = {
      activeShipments: 0,
      arrivingToday: 0,
      arrivingTodayCargo: 0,
      totalCargo: 0,
      suppliers: new Set(),
    }

    data.shipments.forEach(shipment => {
      // Count active shipments (in-transit or arriving)
      if (shipment.status === 'in-transit' || shipment.status === 'arriving') {
        metrics.activeShipments++
      }

      // Count shipments arriving today
      const eta = new Date(shipment.estimated_day_of_arrival)
      if (eta >= today && eta < tomorrow) {
        metrics.arrivingToday++
        metrics.arrivingTodayCargo += shipment.cargo_metric_tons
      }

      // Sum total cargo
      metrics.totalCargo += shipment.cargo_metric_tons

      // Count unique suppliers
      if (shipment.supplier) {
        metrics.suppliers.add(shipment.supplier)
      }
    })

    return metrics
  }

  const metrics = calculateMetrics()

  const cards = [
    {
      title: "Active Shipments",
      icon: Ship,
      value: isLoading ? "..." : String(metrics.activeShipments),
      change: "+2", // This could be calculated if we had historical data
      changeText: "from last week",
      changePositive: true,
      color: "blue",
      tooltip: "Currently active shipments in transit",
    },
    {
      title: "Arriving Today",
      icon: Anchor,
      value: isLoading ? "..." : String(metrics.arrivingToday),
      subValue: isLoading ? "" : `${metrics.arrivingTodayCargo.toLocaleString()} Metric Tons`,
      color: "amber",
      tooltip: "Shipments scheduled to arrive today",
    },
    {
      title: "Total Cargo (MTons)",
      icon: TruckIcon,
      value: isLoading ? "..." : metrics.totalCargo.toLocaleString(),
      change: "+14%", // This could be calculated if we had historical data
      changeText: "from last month",
      changePositive: true,
      color: "green",
      tooltip: "Total cargo volume in metric tons",
    },
    {
      title: "Suppliers",
      icon: ShipIcon,
      value: isLoading ? "..." : String(metrics.suppliers.size),
      subValue: "Active this month",
      color: "purple",
      tooltip: "Active suppliers this month",
    },
  ]

  return (
    <>
      {cards.map((card, index) => (
        <Card
          key={index}
          className={cn(
            "overflow-hidden group hover:shadow-md transition-all duration-300",
            colorStyles[card.color as keyof typeof colorStyles].border
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              colorStyles[card.color as keyof typeof colorStyles].bg
            )}
          >
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <card.icon className={cn("h-4 w-4", colorStyles[card.color as keyof typeof colorStyles].text)} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{card.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold group-hover:scale-105 transition-transform duration-300">
              {card.value}
            </div>
            <div className="flex items-center pt-1">
              {card.change && (
                <span className={cn("text-xs font-medium", card.changePositive ? "text-green-500" : "text-red-500")}>
                  {card.change}
                </span>
              )}
              {card.changeText && <span className="text-xs text-muted-foreground ml-1">{card.changeText}</span>}
              {card.subValue && <span className="text-xs text-muted-foreground">{card.subValue}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
