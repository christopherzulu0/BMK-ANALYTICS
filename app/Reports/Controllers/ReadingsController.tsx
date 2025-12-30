'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'
import ReadingLines from '@/app/ReadingsInput/page'

export default function ReadingsController() {
    return (
        <TabsContent value="reading" className="space-y-4">
            <ReadingLines />
        </TabsContent>
    )
}