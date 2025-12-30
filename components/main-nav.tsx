"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/Dispatch", label: "Dashboard" },
    { href: "/Dispatch/shipments", label: "Shipments" },
    { href: "/Dispatch/tankage", label: "Tankage" },
    { href: "/Dispatch/reports", label: "Reports" },
    { href: "/Dispatch/analytics", label: "Analytics" },
  ]

  return (
    <nav className={cn("flex items-center gap-1 md:gap-6", className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </Link>
        )
      })}
    </nav>
  )
}

