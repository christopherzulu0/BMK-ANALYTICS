import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Fuel, Gauge, ContainerIcon as Tank } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function TankageOverview() {
  const cards = [
    {
      title: "Total Capacity",
      icon: Tank,
      value: "12,000 MT",
      subValue: "6 tanks total",
      color: "indigo",
      tooltip: "Total storage capacity across all tanks",
    },
    {
      title: "Current Usage",
      icon: Gauge,
      value: "68%",
      subValue: "8,160 MT in storage",
      color: "cyan",
      tooltip: "Current storage utilization percentage",
    },
    {
      title: "Available Space",
      icon: Droplets,
      value: "3,840 MT",
      subValue: "32% remaining",
      color: "teal",
      tooltip: "Remaining available storage capacity",
    },
    {
      title: "Critical Tanks",
      icon: Fuel,
      value: "1",
      subValue: "T3 at 92% capacity",
      color: "red",
      isAlert: true,
      tooltip: "Tanks at critical capacity levels",
    },
  ]

  return (
    <>
      {cards.map((card, index) => (
        <Card
          key={index}
          className={cn(
            "overflow-hidden group hover:shadow-md transition-all duration-300",
            `border-l-4 border-l-${card.color}-500 dark:border-l-${card.color}-600`,
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              `bg-${card.color}-50/50 dark:bg-${card.color}-950/20`,
            )}
          >
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <card.icon className={`h-4 w-4 text-${card.color}-500 dark:text-${card.color}-400`} />
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
              <span className={cn("text-xs", card.isAlert ? "text-red-500 font-medium" : "text-muted-foreground")}>
                {card.subValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

