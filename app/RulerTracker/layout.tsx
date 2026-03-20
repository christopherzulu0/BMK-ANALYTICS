import { requireAuth } from '@/lib/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
// ... (icons etc)
  title: 'TAZAMA Pipeline Management System',
  description: 'Real-time monitoring and management of the TAZAMA pipeline infrastructure across Tanzania and Zambia',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // await requireAuth("dispatcher");
  return (
    <div className="light">
        {children}
    </div>
  )
}
