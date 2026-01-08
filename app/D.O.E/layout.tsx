import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './doe.css'

export const metadata: Metadata = {
  title: 'D.O.E Dashboard',
  description: 'Department of Energy Dashboard',
}

export default function DOELayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
        {children}
        <Analytics />
    </>
  )
}
