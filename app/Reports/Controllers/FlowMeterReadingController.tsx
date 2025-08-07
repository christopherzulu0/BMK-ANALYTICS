'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ReadingsData } from '@/types/readingsData';
import FlowMeterReading from '@/app/FlowMeters/page';

export default function FlowMeterReadingController() {
    const [meter, setMeter] = useState<ReadingsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReadings = async () => {
            try {
                const res = await fetch('/api/readings');
                if (!res.ok) {
                    throw new Error('Failed to fetch readings data');
                }
                const data = await res.json();
                console.log('Reading Controller: Fetched data:', data);
                setMeter(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchReadings();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <TabsContent value="flowMeter" className="space-y-4">
            <FlowMeterReading data={meter} />
        </TabsContent>
    );
}