// components/FlowRateOverviewController.tsx
import React, { useEffect, useState } from 'react';

import { PipelineDataItem } from '@/types/pipelineData';
import FlowRateOverview from '../components/FlowRateOverview';
import { TabsContent } from '@/components/ui/tabs';

export default function PipelineController() {
    const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPipelineData = async () => {
            try {
                const res = await fetch('/api/pipeline-data');
                if (!res.ok) {
                    throw new Error('Failed to fetch pipeline data');
                }
                const data = await res.json();
                console.log('Pipeline Controller: Fetched data:', data);
                setPipelineData(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPipelineData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return(
        <TabsContent value="pipeline" className="space-y-4">
        <FlowRateOverview initialData={pipelineData} />
        </TabsContent>
    );
}