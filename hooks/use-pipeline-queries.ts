import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Type definitions
export interface ReadingLine {
  id: number;
  date: string;
  lineNo: number;
  reading: string;
  flowMeter1: number;
  flowMeter2: number;
  flowRate1: number;
  flowRate2: number;
  sampleTemp: number;
  obsDensity: number;
  kgInAirPerLitre: number;
  remarks: string;
  check: string;
  previousReadingMeter1: number;
  previousReadingMeter2: number;
  pressure: number;
  viscosity: number;
  waterContent: number;
  sulfurContent: number;
  flashPoint: number;
  pourPoint: number;
  apiGravity: number;
  reid: number;
  benzene: number;
  aromatics: number;
  olefins: number;
  saturates: number;
  operator: string;
  verified: boolean;
  anomalies: string[];
  calibrationStatus: string;
  lastCalibration: string;
  nextCalibration: string;
  qualityGrade: string;
  batchNumber: string;
  testResults: string;
}

export interface PipelineData {
  id: number;
  date: string;
  openingReading: number;
  closingReading: number;
  totalFlowRate: number;
  averageFlowrate: number;
  averageObsDensity: number;
  averageTemp: number;
  obsDen15: number;
  kgInAirPerLitre: number;
  metricTons: number;
  calcAverageTemperature: number;
  totalObsDensity: number;
  volumeReductionFactor: number;
  volume20: number;
  efficiency: number;
  uptime: number;
  variance: number;
  qualityIndex: string;
  predictedFlow: number;
  anomalyScore: number;
  maintenanceScore: number;
  energyEfficiency: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
}

// Fetch readings data
export function useReadingsData(date?: string, startDate?: string, endDate?: string) {
  return useQuery<ApiResponse<ReadingLine>, Error>({
    queryKey: ["readings", date, startDate, endDate],
    queryFn: async () => {
      let url = "/api/Root/Readings";

      // Handle different date parameter scenarios
      if (startDate && endDate) {
        // Custom date range
        url = `/api/Root/Readings?startDate=${startDate}&endDate=${endDate}`;
      } else if (date) {
        // Single date or special value (week, month)
        url = `/api/Root/Readings?date=${date}`;
      }

      const response = await axios.get<ApiResponse<ReadingLine>>(url);
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute instead of 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
}

// Fetch pipeline data
export function usePipelineData(date?: string, startDate?: string, endDate?: string) {
  return useQuery<ApiResponse<PipelineData>, Error>({
    queryKey: ["pipeline", date, startDate, endDate],
    queryFn: async () => {
      let url = "/api/Root/Pipeline";

      // Handle different date parameter scenarios
      if (startDate && endDate) {
        // Custom date range
        url = `/api/Root/Pipeline?startDate=${startDate}&endDate=${endDate}`;
      } else if (date) {
        // Single date or special value (week, month)
        url = `/api/Root/Pipeline?date=${date}`;
      }

      const response = await axios.get<ApiResponse<PipelineData>>(url);
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute instead of 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
}
