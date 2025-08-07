import type { Metadata } from "next";
import Head from 'next/head';
import localFont from "next/font/local";
import "./globals.css";
import Providers from '../providers'
import { requireAuth } from "@/lib/auth";
import { AppSidebarPipeline } from "@/components/app-sidebar-pipeline";

const metadata: Metadata = {
  title: "Dispatch Operations",
  description: "Manage and monitor dispatch operations efficiently.",
   icons:'/Tazama-logo.png'
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

export default async function DispatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Require authentication for this layout
  // await requireAuth("dispatcher");
  return (
    <Providers>
            <div className="flex-1 p-4">
              {children}
            </div>
    </Providers>
  );
}
