import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Clock, MapPin, Search, Shield, Truck } from "lucide-react"
import { motion, useScroll, useTransform } from 'framer-motion'

const CoreValues = [
    {
      title: "Innovation",
      description: "We adopt new ideas to improve service delivery.",
      icon: <Truck className="w-6 h-6" />,
    },
    {
      title: "Integrity",
      description: "We are upright in the execution of our responsibilities and duties.",
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      title: "Loyalty",
      description: "We are devoted to our company and have the interest of our clients at heart.",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Team Work",
      description: "We embrace individual diversity and work together to achieve company objectives.",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Customer Focused Feedback",
      description: "We strive to provide quality service to meet our customers’ expectation.",
      icon: <BarChart2 className="w-6 h-6" />,
    },
    {
      title: "Transparency",
      description: "We are open to the execution of our mandate.",
      icon: <Search className="w-6 h-6" />,
    },
  ]

export default function OurValues(){
    return(
        <>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {CoreValues.map((service, index) => (
              <motion.div
                key={service.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                      <span className="mr-2 flex-shrink-0">{service.icon}</span>
                      <span>{service.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm sm:text-base">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
    )
}