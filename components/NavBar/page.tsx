'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession, signIn, signOut } from "next-auth/react"

// Define navigation items based on user role
const getNavigationItems = (role: string) => {
  // const commonItems = [
  //   { name: 'Dashboard', href: '/dashboard', current: true },
  // ];

  const roleBasedItems: { [key: string]: Array<{ name: string; href: string; current: boolean }> } = {
    // admin: [
    //   { name: 'Users', href: '/admin/users', current: false },
    //   { name: 'Settings', href: '/admin/settings', current: false },
    // ],
    // DOE: [
    //   { name: 'Reports', href: '/reports', current: false },
    //   { name: 'Shipments', href: '/shipments', current: false },
    // ],
    // dispatcher: [
    //   { name: 'Dispatch', href: '/dispatch', current: false },
    // ],
  };

  // Return common items plus role-specific items
  return [
    // ...commonItems,
    ...(role && roleBasedItems[role] ? roleBasedItems[role] : []),
  ];
};

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar() {
  // Use the actual session from NextAuth
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userRole = session?.user?.role || '';

  const navigation = getNavigationItems(userRole);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-30 border-b border-gray-200 shadow-lg backdrop-blur-md bg-gradient-to-r from-white/80 via-primary/10 to-white/80"
    >
      <Disclosure as="nav" className="bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden transition-transform group-hover:scale-110" />
                <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block transition-transform group-hover:scale-110" />
              </DisclosureButton>
            </div>
            {/* Branding */}
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  alt="Tazama Logo"
                  src="/Tazama-logo.png"
                  className="h-10 w-10 rounded-full shadow-md border border-gray-200 bg-white object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                <span className="ml-2 text-xl font-bold text-primary hidden sm:inline-block tracking-tight drop-shadow-sm">Tazama Pipelines</span>
              </Link>
              {isAuthenticated && (
                <div className="hidden sm:ml-8 sm:flex sm:items-center">
                  <nav className="flex space-x-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                          item.current
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-700 hover:bg-primary/10 hover:text-primary',
                          'rounded-lg px-4 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                        )}
                        tabIndex={0}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
            {/* Right side: notifications & profile */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {isAuthenticated && (
                <button
                  type="button"
                  className="relative rounded-full bg-gray-100 p-2 text-gray-500 hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="h-6 w-6" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shadow-md">3</span>
                </button>
              )}
              {/* Profile dropdown or Sign In button */}
              {isAuthenticated ? (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <img
                          alt={session?.user?.name || "User"}
                          src={session?.user?.image}
                          className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-9 w-9 text-gray-400" />
                      )}
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-xl bg-white/95 py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in backdrop-blur-md"
                  >
                    <MenuItem>
                      <div className="flex items-center gap-3 px-4 py-3 border-b">
                        {session?.user?.image ? (
                          <img
                            alt={session?.user?.name || "User"}
                            src={session?.user?.image}
                            className="h-12 w-12 rounded-full border border-gray-200 object-cover shadow"
                          />
                        ) : (
                          <UserCircleIcon className="h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-base">{session?.user?.name || 'User'}</span>
                          <span className="text-xs text-gray-500">{session?.user?.email || 'No email'}</span>
                          <span className="text-xs text-primary font-medium mt-1">Role: {session?.user?.role || 'N/A'}</span>
                        </div>
                      </div>
                    </MenuItem>
                    <div className="my-1 border-t border-gray-100" />
                    <MenuItem>
                      <Link href="/settings" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                        Settings
                      </Link>
                    </MenuItem>
                    <div className="my-1 border-t border-gray-100" />
                    <MenuItem>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        Sign out
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="ml-2 bg-primary text-white rounded-lg px-4 py-2 text-base font-semibold shadow-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <DisclosurePanel
          className="sm:hidden bg-white/95 border-t border-gray-200 shadow-md animate-fade-in backdrop-blur-md transition-all duration-300"
          static
        >
          <div className="space-y-1 px-2 pb-3 pt-2 divide-y divide-gray-100">
            {isAuthenticated && navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-primary/10 hover:text-primary',
                  'block rounded-lg px-4 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
                tabIndex={0}
              >
                {item.name}
              </DisclosureButton>
            ))}
            {!isAuthenticated && (
              <DisclosureButton
                as="button"
                onClick={() => signIn()}
                className="w-full bg-primary text-white rounded-lg px-4 py-2 text-base font-semibold shadow-md hover:bg-primary/90 transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Sign in
              </DisclosureButton>
            )}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </motion.header>
  )
}
