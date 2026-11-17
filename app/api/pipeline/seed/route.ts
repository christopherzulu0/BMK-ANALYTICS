import { NextResponse } from 'next/server'
import { seedPipelineData } from '@/lib/actions/seed-pipeline-data'

export async function GET() {
  try {
    const result = await seedPipelineData()
    if (result.success) {
      return NextResponse.json({ message: 'Seeding successful' })
    } else {
      return NextResponse.json({ error: 'Seeding failed', details: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal seed error' }, { status: 500 })
  }
}
