import { requireAuth } from '@/lib/auth';
import type { Metadata } from 'next'
//import './globals.css'

export const metadata: Metadata = {
  title: 'TZ',
  description: 'Shupments',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

   await requireAuth("dispatcher");
  return (
    <div className="text-gray-900 antialiased">
      {children}
    </div>
  )
}
