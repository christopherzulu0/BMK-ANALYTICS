'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PipelineNetworkProps {
  selectedStation: string | null
}

// All stations from TAZAMA pipeline document
const allStations = [
  // Zambia Stations
  { name: 'Bwana Mkubwa Terminal', country: 'Zambia', type: 'Terminal', km: 0 },
  { name: 'Chinsali Pump Station', country: 'Zambia', type: 'Pump', km: 92 },
  { name: 'Kalonje Pump Station', country: 'Zambia', type: 'Pump', km: 176 },
  { name: 'Melela', country: 'Zambia', type: 'Sub-Station', km: 250 },
  { name: 'Chamakweza', country: 'Zambia', type: 'Sub-Station', km: 92 },
  
  // Tanzania Stations
  { name: 'Chilolwa Pig Station', country: 'Tanzania', type: 'Pig Station', km: 959 },
  { name: 'Kigamboni Pump Station', country: 'Tanzania', type: 'Pump', km: 1104 },
  { name: 'Mbeya Pump Station', country: 'Tanzania', type: 'Pump', km: 799 },
  { name: 'Ruaha', country: 'Tanzania', type: 'Sub-Station', km: 381 },
  { name: 'Mtandika', country: 'Tanzania', type: 'Sub-Station', km: 399 },
  { name: 'Ilula', country: 'Tanzania', type: 'Sub-Station', km: 445 },
  { name: 'Malangali', country: 'Tanzania', type: 'Sub-Station', km: 623 },
  { name: 'Mbalamaziwa Pig Station', country: 'Tanzania', type: 'Pig Station', km: 623 },
  { name: 'Danger Hill Pig Station', country: 'Tanzania', type: 'Pig Station', km: 1220 },
  { name: 'Mulilima Pig Station', country: 'Tanzania', type: 'Pig Station', km: 1522 },
  { name: 'Morogoro Pump Station', country: 'Tanzania', type: 'Pump', km: 929 },
  { name: 'Elphon\'s Pass Pump Station', country: 'Tanzania', type: 'Pump', km: 1360 },
  { name: 'Iringa Pump Station', country: 'Tanzania', type: 'Pump', km: 1220 },
  { name: 'Kigamboni Tank Farm', country: 'Tanzania', type: 'Tank Farm', km: 1104 },
]

const flowData = [
  { time: '00:00', bwanaKubwa: 2400, chinsali: 2210, kalonje: 2290, morogoro: 2100, mbeya: 1950 },
  { time: '04:00', bwanaKubwa: 2210, chinsali: 2290, kalonje: 2000, morogoro: 2050, mbeya: 2000 },
  { time: '08:00', bwanaKubwa: 2290, chinsali: 2000, kalonje: 2181, morogoro: 2200, mbeya: 2100 },
  { time: '12:00', bwanaKubwa: 2000, chinsali: 2181, kalonje: 2500, morogoro: 2300, mbeya: 2150 },
  { time: '16:00', bwanaKubwa: 2181, chinsali: 2500, kalonje: 2100, morogoro: 2250, mbeya: 2080 },
  { time: '20:00', bwanaKubwa: 2500, chinsali: 2100, kalonje: 2221, morogoro: 2180, mbeya: 2120 },
  { time: '24:00', bwanaKubwa: 2100, chinsali: 2221, kalonje: 2500, morogoro: 2400, mbeya: 2200 },
]

export default function PipelineNetwork({ selectedStation }: PipelineNetworkProps) {
  return (
    <div className="space-y-6">
      {/* Pipeline Map */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Pipeline Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time pipeline visualization</p>
        </div>

        <div className="bg-secondary rounded-lg p-8 border border-border overflow-x-auto">
          <div className="space-y-4">
            {/* Tanzania Section */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">TANZANIA SECTION (Southern Leg)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allStations.filter(s => s.country === 'Tanzania').map((station) => (
                  <div
                    key={station.name}
                    onClick={() => {}}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedStation === station.name
                        ? 'border-primary bg-primary/20 ring-2 ring-primary'
                        : 'border-border hover:border-primary/50 bg-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{station.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        station.type === 'Pump' ? 'bg-blue-500/20 text-blue-300' :
                        station.type === 'Pig Station' ? 'bg-orange-500/20 text-orange-300' :
                        station.type === 'Tank Farm' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {station.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">KM: {station.km}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Zambia Section */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">ZAMBIA SECTION (Northern Leg)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allStations.filter(s => s.country === 'Zambia').map((station) => (
                  <div
                    key={station.name}
                    onClick={() => {}}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedStation === station.name
                        ? 'border-primary bg-primary/20 ring-2 ring-primary'
                        : 'border-border hover:border-primary/50 bg-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{station.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        station.type === 'Pump' ? 'bg-blue-500/20 text-blue-300' :
                        station.type === 'Terminal' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {station.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">KM: {station.km}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">Total Distance</p>
            <p className="text-lg font-bold">1,703 KM</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">Pump Stations</p>
            <p className="text-lg font-bold">8</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">All Facilities</p>
            <p className="text-lg font-bold">{allStations.length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">Countries</p>
            <p className="text-lg font-bold">2</p>
          </div>
        </div>
      </Card>

      {/* Flow Rate Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Flow Rates (24h)</h2>
          <p className="text-sm text-muted-foreground">Liters per hour across stations</p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="bwanaKubwa" name="Bwana Mkubwa" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="chinsali" name="Chinsali" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="kalonje" name="Kalonje" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="morogoro" name="Morogoro" stroke="#ec4899" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="mbeya" name="Mbeya" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
