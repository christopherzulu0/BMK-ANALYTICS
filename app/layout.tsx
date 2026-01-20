import type { Metadata } from 'next';
import localFont from "next/font/local";
import "./globals.css";
import Providers from './providers'
import BottomNavigation from "@/components/Navigator/BottomNavigation";
import Navbar from './LandingPage/NavBar/Navbar';

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
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="text-gray-900 antialiased">
      <Navbar />
        <Providers>
          <main className="min-h-screen w-full">
            {children}
                  </main>
                  {/* <BottomNavigation /> */}
        </Providers>
      </body>
    </html>
  );
}
