export function linearRegression(data) {
  const n = data.length;
  if (n === 0) {
    return { slope: 0, intercept: 0 }; // Handle empty data case
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const y = data[i].totalFlowRate;

    // Ensure the totalFlowRate is a valid number
    if (typeof y !== 'number' || isNaN(y)) {
      console.error(`Invalid totalFlowRate at index ${i}: ${y}`);
      return { slope: 0, intercept: 0 }; // Exit early if invalid data found
    }

    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    console.error('Division by zero in slope calculation');
    return { slope: 0, intercept: 0 }; // Prevent division by zero
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function predictNextValue(data) {
  const { slope, intercept } = linearRegression(data);
  return slope * data.length + intercept;
}

export function detectAnomalies(data, threshold = 2) {
  const values = data.map(item => item.metricTons).filter(val => typeof val === 'number' && !isNaN(val));

  if (values.length === 0) {
    console.error('No valid metricTons values in data');
    return data.map(item => ({ ...item, isAnomaly: false })); // Return default
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

  return data.map(item => {
    const flowRate = item.totalFlowRate;
    
    if (typeof flowRate !== 'number' || isNaN(flowRate)) {
      console.error(`Invalid totalFlowRate in anomaly detection: ${flowRate}`);
      return { ...item, isAnomaly: false }; // Mark as not anomaly if invalid
    }

    const isAnomaly = Math.abs(flowRate - mean) > threshold * stdDev;
    return { ...item, isAnomaly };
  });
}
