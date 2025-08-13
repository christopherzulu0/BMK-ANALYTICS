'use client'
import React from 'react'
import { Home, BarChart2, LayoutDashboard, ClipboardList, Settings, Database, Menu, Ship, Bell, Users, Wrench, Fuel } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

export default function BottomNavigation() {
    const router = useRouter();

    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Volume Metrics', icon: BarChart2, path: '/Pipeline' },
        { name: 'Readings Input', icon: ClipboardList, path: '/ReadingsInput' },
        { name: 'Dispatch', icon: Database, path: '/Dispatch' },
    ];

    const menuItems = [
        { name: 'FlowRate', icon: LayoutDashboard, path: '/FlowRate' },
        { name: 'Tankage', icon: Fuel, path: '/Tanks' },
        { name: 'Shipments', icon: Ship, path: '/Dispatch/shipments' },
        { name: 'Flow Meters', icon: Bell, path: '/FlowMeters' },
        //{ name: 'Users', icon: Users, path: '/users' },
        //{ name: 'Maintenance', icon: Wrench, path: '/maintenance' },
        //{ name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <TooltipProvider>
            <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-800 dark:border-gray-700 shadow-lg ">
                <div className="grid h-full grid-cols-5 mx-auto ">
                    {navItems.slice(0, 2).map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => router.push(item.path)}
                                    variant="ghost"
                                    className="flex flex-col items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500 rounded-none"
                                >
                                    <item.icon className="w-5 h-5 mb-1" />
                                    <span className="sr-only">{item.name}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                                {item.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}

                    {/* Central Menubar Button */}
                    <div className="flex items-center justify-center">
                        <Menubar className="h-full border-none bg-transparent shadow-none">
                            <MenubarMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <MenubarTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="icon"
                                                className="w-12 h-12 rounded-full  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md -translate-y- transition-transform duration-200 ease-in-out hover:-translate-y-5"
                                            >
                                                <Menu className="w-6 h-6" />
                                                <span className="sr-only">Menu</span>
                                            </Button>
                                        </MenubarTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center">
                                       Menu
                                    </TooltipContent>
                                </Tooltip>
                                <MenubarContent align="center" className="w-48">
                                    {menuItems.map((item) => (
                                        <MenubarItem key={item.name} onClick={() => router.push(item.path)}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span>{item.name}</span>
                                        </MenubarItem>
                                    ))}
                                    <MenubarSeparator />
                                    {/*<MenubarItem onClick={() => router.push('/settings')}>*/}
                                    {/*    <Settings className="mr-2 h-4 w-4" />*/}
                                    {/*    <span>Settings</span>*/}
                                    {/*</MenubarItem>*/}
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>

                    {navItems.slice(2, 4).map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => router.push(item.path)}
                                    variant="ghost"
                                    className="flex flex-col items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500 rounded-none"
                                >
                                    <item.icon className="w-5 h-5 mb-1" />
                                    <span className="sr-only">{item.name}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                                {item.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
