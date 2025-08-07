"use client"

import { useState, useEffect } from 'react'
import { predictNextValue, detectAnomalies } from '@/utils/analytics'
import DataChart from './DataChart'
import DataTable from './DataTable'
import AnalyticsPieChart from './AnalyticsPieChart'
import { PipelineDataItem } from '@/types/pipelineData'
import FlowRateGraph from './FlowRateGraph'
import CsvUploader from './CsvUploader'
import ReadingsData from './ReadingsData'
import ReadingUploader from './ReadingUploader'

interface PipelineOperationsProps {
  initialData: PipelineDataItem[]
}

export default function PipelineOperations({ initialData }: PipelineOperationsProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [allData, setAllData] = useState(initialData)
  const [filteredData, setFilteredData] = useState(initialData)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)

  }, [])




  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const dataWithAnomalies = detectAnomalies(allData)
  const predictedValue = predictNextValue(allData)


  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <DataChart data={dataWithAnomalies} />
          </div>
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <AnalyticsPieChart data={allData} />
          </div>
          <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
            <FlowRateGraph data={allData} />
          </div>
          <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
            <ReadingsData />
          </div>
        </div>

        <CsvUploader />
        <ReadingUploader/>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <DataTable data={dataWithAnomalies.map(item => ({ ...item, date: formatDate(new Date(item.date)) }))} />
        </div>
        <div className="mt-4 p-4 bg-white shadow-xl rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Predicted Next Metric Tons</h2>
          <p className="text-2xl font-bold">{predictedValue.toFixed(2)}</p>
        </div>



      </div>
    </>
  )
}
