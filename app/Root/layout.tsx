import type { Metadata } from 'next'
import './globals.css'
import { requireAuth } from '@/lib/auth';
import Providers from '../providers';

export const metadata: Metadata = {
  title: 'Root Users',
  description: 'Tazama Dashboard',
  icons:'/Tazama-logo.png'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAuth("admin");
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <Providers>
        <div className="flex flex-col h-full w-full overflow-hidden">
          {children}
        </div>
      </Providers>
    </div>
  )
}
