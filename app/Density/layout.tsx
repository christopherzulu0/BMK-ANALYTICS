import Providers from '../providers'
import type { Metadata } from "next";
import Head from 'next/head';
import localFont from "next/font/local";
import "../globals.css";
import { requireAuth } from "@/lib/auth";
import { AppSidebarPipeline } from '@/components/app-sidebar-pipeline';

const metadata: Metadata = {
  title: "Tazama Pipeline Operations",
  description: "Manage and monitor pipeline operations efficiently.",
};

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap', // Ensures text remains visible during webfont load
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

export default async function DensityLayout({ children }: { children: React.ReactNode }) {
  // Require authentication for this layout
  await requireAuth("DOE");
  return (
    <div className="flex min-h-screen">
      {/* Left Navigation Sidebar */}
      <div className="w-64 shrink-0 fixed h-full hidden md:block border-r z-30">
        <AppSidebarPipeline />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 z-0 relative isolate">
        <div className="relative min-h-screen overflow-y-auto">
          {/* Main Content Area */}
          <div className="flex-1 p-4 overflow-x-hidden  mx-auto max-w-4xl">
            <Providers>
              {children}
            </Providers>
          </div>
        </div>
      </div>
    </div>
  );
}
