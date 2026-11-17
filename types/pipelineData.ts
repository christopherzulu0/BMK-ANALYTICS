// @/types/pipelineData.ts
export interface PipelineDataItem {
    id: number;
    date: Date;
    openningReading: number;
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
  }