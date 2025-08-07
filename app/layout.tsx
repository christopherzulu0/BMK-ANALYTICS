import Head from 'next/head';
import localFont from "next/font/local";
import "./globals.css";
import Providers from './providers'
import BottomNavigation from "@/components/Navigator/BottomNavigation";



export const metadata: Metadata = {
  title: 'Tazama Pipeline Limited',
  description: 'Home Page',
  icons:'/Tazama-logo.png'
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap', // Ensures text remains visible during webfont load
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{String(metadata.title) || ''}</title>
        <meta name="description" content={String(metadata.description) || ''} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root {
            ${geistSans.variable};
            ${geistMono.variable};
          }
        `}</style>
      </Head>
      <body className="text-gray-900 antialiased">
        <Providers>
          <main className="min-h-screen w-full">
            {children}
                  </main>
                  <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
