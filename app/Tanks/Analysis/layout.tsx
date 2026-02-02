import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Tanks Analysis',
  description: 'Tank analysis dashboard',
}

export default async function AnalysisLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

   await requireAuth("dispatcher");
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
