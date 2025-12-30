"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, Menu, Settings, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainNav } from "@/components/main-nav"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const [notificationCount, setNotificationCount] = useState(3)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
      )}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <div className="flex h-16 items-center border-b px-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-primary rounded-full"></div>
                  <span className="font-bold">Pipeline Ops</span>
                </div>
              </div>
              <nav className="flex flex-col gap-4 py-4">
                <div className="px-2 py-4">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Main Navigation</h2>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/Dispatch">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/Dispatch/shipments">Shipments</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/Dispatch/tankage">Tankage</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/Dispatch/reports">Reports</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/Dispatch/settings">Settings</Link>
                    </Button>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/Dispatch" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
              <div className="h-3 w-3 bg-primary-foreground rounded-full"></div>
            </div>
            <span className="hidden font-bold sm:inline-block text-lg">Pipeline Ops</span>
          </Link>
          <MainNav className="hidden md:flex" />
        </div>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="relative w-full max-w-[200px] md:max-w-[300px] animate-in fade-in duration-300">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-9 md:w-[300px] focus-visible:ring-primary"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex w-full">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <Bell className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Critical Tank Level</div>
                      <div className="text-sm text-muted-foreground">Tank T3 is at 92% capacity</div>
                      <div className="text-xs text-muted-foreground mt-1">10 minutes ago</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex w-full">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Bell className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Shipment Arriving</div>
                      <div className="text-sm text-muted-foreground">Vessel 10042 will arrive today</div>
                      <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer p-3 hover:bg-muted/50">
                  <div className="flex w-full">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Bell className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">System Update</div>
                      <div className="text-sm text-muted-foreground">New features have been deployed</div>
                      <div className="text-xs text-muted-foreground mt-1">3 hours ago</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 gap-2 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">OP</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@pipelineops.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

