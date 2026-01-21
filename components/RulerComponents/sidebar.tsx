'use client'

import { 
  BarChart3, 
  Zap, 
  AlertCircle, 
  Users, 
  Settings,
  Fuel,
  Scale,
  Wrench,
  ClipboardList,
  FileText,
  Shield,
  Truck,
  Droplets,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  activeModule?: string
  onModuleChange?: (module: string) => void
}

const menuItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'fuel-input', icon: Fuel, label: 'Fuel Input' },
  { id: 'inventory', icon: Scale, label: 'Inventory' },
  { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
  { id: 'shift-handover', icon: ClipboardList, label: 'Shift Handover' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'incidents', icon: Shield, label: 'Safety & Incidents' },
  { id: 'pig-tracking', icon: Truck, label: 'PIG Tracking' },
  { id: 'leak-detection', icon: Droplets, label: 'Leak Detection' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, activeModule = 'dashboard', onModuleChange }: SidebarProps) {
  const handleItemClick = (id: string) => {
    onModuleChange?.(id)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300",
        !isOpen && "w-20"
      )}>
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                activeModule === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className={cn(
            "p-3 rounded-lg bg-sidebar-accent text-center",
            isOpen ? "space-y-2" : "flex items-center justify-center"
          )}>
            {isOpen ? (
              <>
                <p className="text-xs font-semibold text-sidebar-foreground">System Status</p>
                <p className="text-lg font-bold text-green-500">Online</p>
              </>
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <aside className="lg:hidden fixed inset-0 z-40 bg-black/50">
          <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    activeModule === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-3 py-4 border-t border-sidebar-border">
              <div className="p-3 rounded-lg bg-sidebar-accent text-center space-y-2">
                <p className="text-xs font-semibold text-sidebar-foreground">System Status</p>
                <p className="text-lg font-bold text-green-500">Online</p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
