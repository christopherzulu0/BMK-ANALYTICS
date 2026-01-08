import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PredictiveETACard() {
  const predictions = [
    {
      shipmentId: "SHP-001",
      vessel: "MV Pacific",
      predictedDelayHours: 12,
      riskCategory: "MEDIUM",
      confidenceScore: 87,
      supplier: "Global Logistics",
    },
    {
      shipmentId: "SHP-002",
      vessel: "MV Nordic",
      predictedDelayHours: 0,
      riskCategory: "LOW",
      confidenceScore: 94,
      supplier: "Trans-Ocean",
    },
    {
      shipmentId: "SHP-003",
      vessel: "MV Ocean",
      predictedDelayHours: 48,
      riskCategory: "HIGH",
      confidenceScore: 91,
      supplier: "Asia Cargo",
    },
  ]

  const getRiskColor = (risk) => {
    const colors = { LOW: "bg-green-50", MEDIUM: "bg-yellow-50", HIGH: "bg-red-50" }
    return colors[risk] || "bg-gray-50"
  }

  const getRiskBadge = (risk) => {
    const variants = { LOW: "default", MEDIUM: "secondary", HIGH: "destructive" }
    return variants[risk] || "default"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Predictive ETA & Delay Risk</CardTitle>
        <p className="text-sm text-gray-600 mt-1">AI-powered delay forecasting</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((pred) => (
          <div key={pred.shipmentId} className={`p-4 rounded-lg ${getRiskColor(pred.riskCategory)} space-y-3`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm text-gray-900">{pred.vessel}</p>
                <p className="text-xs text-gray-600">{pred.supplier}</p>
              </div>
              <Badge variant={getRiskBadge(pred.riskCategory)}>{pred.riskCategory} RISK</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Predicted Delay</p>
                <p className="font-semibold text-sm text-gray-900">{pred.predictedDelayHours}h</p>
              </div>
              <div>
                <p className="text-gray-600">Confidence</p>
                <p className="font-semibold text-sm text-gray-900">{pred.confidenceScore}%</p>
              </div>
              <div>
                <p className="text-gray-600">ID</p>
                <p className="font-semibold text-sm text-gray-900">{pred.shipmentId}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
