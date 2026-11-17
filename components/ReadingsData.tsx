import { ReadingsData } from '@/types/readingsData';
import React, { Suspense, useState, useEffect } from 'react'
import DailyReadings from './DailyReadings';
import DailyFlow from './Skeletons/DailyFlow'
async function fetchReadingsData(): Promise<ReadingsData[]> {
    const res = await fetch('http://localhost:3000/api/readings', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch pipeline data');
    }
    return res.json();
  }
  

function ReadingsDataWrapper() {
  const [readings, setReadings] = useState<ReadingsData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReadingsData()
      .then(data => {
        setReadings(data); // Now data is of type ReadingsData[] which matches the state type
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return<DailyFlow/>;
  if (error) return <div>Error: {error}</div>;

  return <DailyReadings data={readings || []} />;
}
  
export default function Readings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReadingsDataWrapper />
    </Suspense>
  );
}
