import type { Metadata } from 'next'
//import './globals.css'

export const metadata: Metadata = {
  title: 'TZ',
  description: 'Shupments',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="text-gray-900 antialiased">
      {children}
    </div>
  )
}
