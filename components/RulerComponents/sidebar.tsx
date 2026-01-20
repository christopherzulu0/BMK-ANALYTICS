'use client'

import { BarChart3, Zap, AlertCircle, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
}

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', active: true },
  { icon: Zap, label: 'Operations', active: false },
  { icon: AlertCircle, label: 'Alerts', active: false },
  { icon: Users, label: 'Facilities', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState(0)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300",
        !isOpen && "w-20"
      )}>
        <div className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveItem(index)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                activeItem === index
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="px-4 py-6 border-t border-sidebar-border">
          <div className={cn(
            "p-3 rounded-lg bg-sidebar-accent text-center",
            isOpen ? "space-y-2" : "flex items-center justify-center"
          )}>
            {isOpen ? (
              <>
                <p className="text-xs font-semibold text-sidebar-foreground">Capacity</p>
                <p className="text-2xl font-bold text-sidebar-primary">78%</p>
              </>
            ) : (
              <span className="text-xs font-bold">78%</span>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <aside className="lg:hidden fixed inset-0 z-40 bg-black/50">
          <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveItem(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeItem === index
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-4 py-6 border-t border-sidebar-border">
              <div className="p-3 rounded-lg bg-sidebar-accent text-center space-y-2">
                <p className="text-xs font-semibold text-sidebar-foreground">Capacity</p>
                <p className="text-2xl font-bold text-sidebar-primary">78%</p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
