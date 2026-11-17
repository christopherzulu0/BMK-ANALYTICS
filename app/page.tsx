

import { Suspense } from 'react';
import PipelineOperations from '@/components/PipelineOperations';
import { PipelineDataItem } from '@/types/pipelineData';

import LandingPage from './LandingPage/page'
async function fetchPipelineData(): Promise<PipelineDataItem[]> {
  const res = await fetch('http://localhost:3000/api/pipeline-data', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch pipeline data');
  }
  return res.json();
}

async function PipelineDataFetcher() {
  const pipelineData = await fetchPipelineData();
  return <PipelineOperations initialData={pipelineData} />;
}

export default function Home() {
  return (
    <>
    <LandingPage/>
    </>
   
    // <>
    // <main className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-7xl mx-auto">
    //     <h1 className="text-3xl font-bold text-gray-900 mb-6">Pipeline Daily Operations</h1>
    //     <PipelineDataFetcher />
    //   </div>
    // </main>
    // </>
   
  );
}