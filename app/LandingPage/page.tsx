"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { MapPin, Phone, Mail, Clock, Truck, BarChart2, Shield, Search, AlertTriangle, CheckCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import NavBar from '@/components/NavBar/page'
import HeroSection from './components/HeroSection'
import OurValues from './components/OurValues'

// NOTE: If you see module not found errors for 'framer-motion', 'recharts', 'lucide-react', or '@tanstack/react-query', install them with npm or yarn.
// npm install framer-motion recharts lucide-react @tanstack/react-query

// Empty data instead of mock data
const pipelineStats = {
  length: 0,
  capacity: 0,
  currentUtilization: 0,
  activeClients: 0,
}



// Compute monthly and yearly analytics from shipments



const faqItems: any[] = []

const pipelineStatus: any[] = []

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const pipelineMarkers: any[] = []

export default function Home() {
  const [activeTab, setActiveTab] = useState("monthly")
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [isVisible, setIsVisible] = useState(false)
  const [currentUtilization, setCurrentUtilization] = useState(pipelineStats.currentUtilization)
  const [notifications, setNotifications] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' })
  const { data: shipmentsData, isLoading: isShipmentsLoading, isError: isShipmentsError } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const res = await axios.get('/api/shipments');
      return res.data?.shipments ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const [transportations, setTransportations] = useState<any[]>([]);

  // Update transportations when shipmentsData changes
  useEffect(() => {
    if (shipmentsData) {
      setTransportations(shipmentsData);
    }
  }, [shipmentsData]);
  const [notificationMessage, setNotificationMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUtilization(prev => {
        const newValue = prev + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(Math.max(newValue, 0), 100)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked)
    setNotificationMessage(checked ? "Notifications enabled. You will receive real-time pipeline updates." : "Notifications disabled. You will no longer receive pipeline updates.")
    setTimeout(() => setNotificationMessage(""), 3000)
  }

  const sortTransportations = useCallback((key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    setTransportations(prev => [...prev].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    }));
  }, [sortConfig]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = transportations.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Compute monthly analytics
  const monthlyVolume = useMemo(() => {
    if (!shipmentsData) return [];
    const monthlyMap: { [key: string]: { month: string; volume: number; efficiency?: number } } = {};
    shipmentsData.forEach((shipment: any) => {
      if (!shipment.date || !shipment.cargo_metric_tons) return;
      const dateObj = new Date(shipment.date);
      const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, volume: 0 };
      }
      monthlyMap[monthKey].volume += Number(shipment.cargo_metric_tons);
      // If you have efficiency, add it here
    });
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [shipmentsData]);

  // Compute yearly analytics
  const yearlyVolume = useMemo(() => {
    if (!shipmentsData) return [];
    const yearlyMap: { [key: string]: { year: string; volume: number; efficiency?: number } } = {};
    shipmentsData.forEach((shipment: any) => {
      if (!shipment.date || !shipment.cargo_metric_tons) return;
      const dateObj = new Date(shipment.date);
      const yearKey = `${dateObj.getFullYear()}`;
      if (!yearlyMap[yearKey]) {
        yearlyMap[yearKey] = { year: yearKey, volume: 0 };
      }
      yearlyMap[yearKey].volume += Number(shipment.cargo_metric_tons);
      // If you have efficiency, add it here
    });
    return Object.values(yearlyMap).sort((a, b) => a.year.localeCompare(b.year));
  }, [shipmentsData]);

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      {/* <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TAZAMA Pipelines Limited</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-gray-300 transition-colors">Services</a></li>
              <li><a href="#stats" className="hover:text-gray-300 transition-colors">Stats</a></li>
              <li><a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a></li>
              <li><a href="#contact" className="hover:text-gray-300 transition-colors">Contact</a></li>
            </ul>
          </nav>
        </div>
      </motion.header> */}
       <NavBar/>
        {/* Hero Section */}
        <motion.section
          style={{ opacity, scale }}
         
        >
         <HeroSection/>
        </motion.section>
      <main className="container py-8">
        {/* Notification */}
        {notificationMessage && (
          <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50">
            {notificationMessage}
          </div>
        )}

       

        {/* Real-time Pipeline Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time Pipeline Status</span>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationToggle} />
                  <Label htmlFor="notifications">Notifications</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Current Utilization:</span>
                <span className="text-2xl font-bold">{currentUtilization.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${currentUtilization}%` }}></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {currentUtilization > 90 ? (
                  <div className="flex items-center justify-center space-x-2 text-red-500">
                    <AlertTriangle />
                    <span>High Utilization</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-green-500">
                    <CheckCircle />
                    <span>Normal Operation</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Next Maintenance:</span>
                  <br />
                  <span>In 7 days</span>
                </div>
                <div>
                  <span className="font-semibold">Estimated Downtime:</span>
                  <br />
                  <span>4 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Pipeline Stats */}
        <motion.section
          id="stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Pipeline Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Object.entries(pipelineStats).map(([key, value], index) => (
              <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card className="text-center h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg md:text-xl">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.p
                      className="text-2xl sm:text-3xl md:text-4xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                    >
                      {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                      {key === 'length' ? ' km' : key === 'capacity' ? ' barrels' : key === 'currentUtilization' ? '%' : ''}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Transportations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Recent Transportations</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => sortTransportations('date')} className="cursor-pointer">
                    Date <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead onClick={() => sortTransportations('company')} className="cursor-pointer">
                    Company <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead onClick={() => sortTransportations('volume')} className="cursor-pointer">
                    Volume (barrels) <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead onClick={() => sortTransportations('destination')} className="cursor-pointer">
                    Destination <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead onClick={() => sortTransportations('status')} className="cursor-pointer">
                    Status <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isShipmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : isShipmentsError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">Failed to load shipments</TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No shipments found</TableCell>
                  </TableRow>
                ) : currentItems.map((transport: any, index: number) => (
                  <motion.tr
                    key={transport.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <TableCell>{transport.date ? new Date(transport.date).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{transport.supplier || ''}</TableCell>
                    <TableCell>{transport.cargo_metric_tons ? transport.cargo_metric_tons.toLocaleString() : ''}</TableCell>
                    {/* If destination is not available in your shipment model, leave blank or add logic here */}
                    <TableCell>{transport.destination || ''}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transport.status === 'Completed' ? 'bg-green-200 text-green-800' :
                        transport.status === 'In Transit' ? 'bg-blue-200 text-blue-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {transport.status}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-2 py-4">
              <Button
                className="border px-2 py-1 text-sm flex items-center"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span>
                Page {currentPage} of {Math.ceil(transportations.length / itemsPerPage)}
              </span>
              <Button
                className="border px-2 py-1 text-sm flex items-center"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(transportations.length / itemsPerPage)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.section>

        {/* Volume Charts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Transportation Analytics</h2>
          <Tabs defaultValue="monthly" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              <TabsTrigger value="yearly">Yearly View</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <Card className="p-2 sm:p-4">
                <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{fontSize: 12}} />
                      <YAxis yAxisId="left" tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: '12px', marginTop: '10px'}} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="volume"
                        stroke="#8884d8"
                        name="Volume (metric tons)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="yearly">
              <Card className="p-2 sm:p-4">
                <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{fontSize: 12}} />
                      <YAxis yAxisId="left" tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: '12px', marginTop: '10px'}} />
                      <Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume (metric tons)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="distribution">
              <Card className="p-2 sm:p-4">
                <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pipelineStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelStyle={{ fontSize: '12px' }}
                      >
                        {pipelineStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* Services Overview */}
        <motion.section
          id="services"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-12"
        >
          <OurValues/>
        </motion.section>

        {/* Interactive Pipeline Map */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Interactive Pipeline Map</h2>
          <Card className="p-2 sm:p-4">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8062024.476857808!2d29.837379085893257!3d-6.3702420056297615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184b51314869a111%3A0x885a17314bc1c430!2sTanzania!5e0!3m2!1sen!2sus!4v1620764296273!5m2!1sen!2sus"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </Card>
        </motion.section>

        {/* FAQ Section */}
        {/* <motion.section
          id="faq"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section> */}

        {/* Call to Action */}
        {/* <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mb-12 text-center"
        >
          <Card className="bg-primary text-primary-foreground p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Optimize Your Oil Transportation?</h2>
            <p className="text-sm sm:text-base mb-4 sm:mb-6">Join the leading Oil Marketing Companies using TAZAMA Pipelines for efficient and reliable transportation.</p>
            <Button className="px-6 py-3 text-lg bg-secondary text-secondary-foreground rounded">Get Started Today</Button>
          </Card>
        </motion.section> */}
      </main>


      {/* Floating Action Button for Quick Quote */}
      {/* {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-lg sm:text-xl md:text-2xl">
                <span className="sr-only">Quick Quote</span>
                💬
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Get a Quick Quote</DialogTitle>
                <DialogDescription>
                  Provide basic details for a quick estimate on your transportation needs.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="quick-volume" className="sm:text-right">
                    Volume (barrels)
                  </Label>
                  <Input id="quick-volume" className="sm:col-span-3" type="number" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="quick-destination" className="sm:text-right">
                    Destination
                  </Label>
                  <Input id="quick-destination" className="sm:col-span-3" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="quick-product" className="sm:text-right">
                    Product Type
                  </Label>
                  <div className="sm:col-span-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="jet-fuel">Jet Fuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button type="submit">Get Estimate</Button>
            </DialogContent>
          </Dialog>
        </motion.div>
      )} */}
    </div>
  )
}
