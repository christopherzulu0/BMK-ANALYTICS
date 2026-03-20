import type { Metadata } from 'next';
import localFont from "next/font/local";
import "./globals.css";
import Providers from './providers'
import BottomNavigation from "@/components/Navigator/BottomNavigation";
import Navbar from './LandingPage/NavBar/Navbar';
import { ThemeProvider } from '@/components/theme-provider';
import Head from 'next/head';
import Script from 'next/script';

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
      <Head>
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined' && window.matchMedia) {
                  const mql = window.matchMedia('(prefers-color-scheme: dark)');
                  if (mql && !mql.addListener) {
                    MediaQueryList.prototype.addListener = function(cb) {
                      this.addEventListener('change', cb);
                    };
                    MediaQueryList.prototype.removeListener = function(cb) {
                      this.removeEventListener('change', cb);
                    };
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </Head>
      <body className="text-gray-900 antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            <main className="min-h-screen w-full">
                <Navbar />
              {children}
            </main>
            {/* <BottomNavigation /> */}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
