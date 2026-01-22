"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, Search, Bell, User } from "lucide-react"
import "./nav-styles.css"

function PipelineLogo() {
  return (
    <Image
      src="/Tazama-logo.png"
      alt="Tazama Pipeline Limited Logo"
      width={40}
      height={40}
      className="w-10 h-10 object-contain"
      priority
    />
  )
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3)
  const [searchFocus, setSearchFocus] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

  const solutions = [
    { name: "Tankage", desc: "Monitor and manage tank inventory levels", icon: "🛢️", href: "/Tanks" },
    { name: "Volume Metrics", desc: "Track volume data and metrics in real-time", icon: "📏", href: "/Pipeline" },
    { name: "Flow Rate Tracking", desc: "Monitor flow rates across pipelines", icon: "💧", href: "/FlowRate" },
    { name: "Readings", desc: "Input and manage daily operational readings", icon: "📝", href: "/ReadingsInput" },
    { name: "Tank Analysis", desc: "Analyze tank performance and trends", icon: "🔍", href: "/Tanks/Analysis" },
    { name: "Split Screens", desc: "View multiple data streams simultaneously", icon: "📑", href: "/split" },
    { name: "Ruler Track", desc: "Track measurements and ruler data", icon: "📐", href: "/RulerTracker" },
    { name: "Shippers", desc: "Manage and track shipment operations", icon: "📦", href: "/Shippers" },
  ]

  const company = [
    { name: "Dispatch", href: "/Dispatch" },
    { name: "Permissions", href: "/Permissions" },
    { name: "Admin", href: "/admin" },
  ]

    const uploads = [
    { name: "Metric Tons", href: "/ManualUpload/MetricTons" },
    { name: "Readings", href: "/ManualUpload/Readings" },
 
  ]

  return (
    <>

      {/* Desktop Navbar */}
      <nav 
        className="hidden lg:flex items-center justify-between px-8 py-3 text-white shadow-lg sticky top-0 z-40"
        style={{
          background: 'linear-gradient(to right, #1e293b, #dc2626)'
        }}
      >
        {/* Logo & Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <div className="flex items-center justify-center text-primary-foreground">
            <PipelineLogo />
          </div>
          <span className="text-balance">PipelineFlow</span>
        </Link>

        {/* Center Navigation */}
        <div className="flex items-center gap-1 ml-12">
          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSolutionOpen(!solutionOpen)}
              className="flex items-center gap-1 hover:opacity-90 transition-opacity font-medium px-4 py-2 rounded-md hover:bg-white/15"
            >
              Solutions
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${solutionOpen ? "rotate-180" : ""}`}
              />
            </button>
            {solutionOpen && (
              <div className="absolute top-full left-0 mt-3 w-96 bg-white text-foreground rounded-xl shadow-2xl p-5 z-50 border border-secondary/20">
                <div className="grid grid-cols-2 gap-4">
                  {solutions.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSolutionOpen(false)}
                      className="p-4 rounded-lg hover:bg-secondary/15 transition-all duration-200 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>


         

          {/* Company Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCompanyOpen(!companyOpen)}
              className="flex items-center gap-1 hover:opacity-90 transition-opacity font-medium px-4 py-2 rounded-md hover:bg-white/15"
            >
              Company
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${companyOpen ? "rotate-180" : ""}`} />
            </button>
            {companyOpen && (
              <div className="absolute top-full left-0 mt-3 w-52 bg-white text-foreground rounded-xl shadow-2xl z-50 border border-secondary/20 overflow-hidden">
                <div className="py-2">
                  {company.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setCompanyOpen(false)}
                      className="block px-4 py-2.5 hover:bg-secondary/10 transition-colors text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-secondary/20 my-2" />
                  <Link
                    href="#"
                    className="block px-4 py-2.5 hover:bg-secondary/10 transition-colors text-sm font-medium"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
          </div>



 {/**Uploads Dropdown */}
           
          <div className="relative">
            <button
              onClick={() => setUploadOpen(!uploadOpen)}
              className="flex items-center gap-1 hover:opacity-90 transition-opacity font-medium px-4 py-2 rounded-md hover:bg-white/15"
            >
             Uploads
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${uploadOpen ? "rotate-180" : ""}`}
              />
            </button>
            {uploadOpen && (
              <div className="absolute top-full left-0 mt-3 w-96 bg-white text-foreground rounded-xl shadow-2xl p-5 z-50 border border-secondary/20">
                <div className="grid grid-cols-2 gap-4">
                  {uploads.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSolutionOpen(false)}
                      className="p-4 rounded-lg hover:bg-secondary/15 transition-all duration-200 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>



          <Link
            href="/ReadingsInput"
            className="hover:opacity-90 transition-opacity font-medium px-4 py-2 rounded-md hover:bg-white/15"
          >
            Readings
          </Link>
          {/* <Link
            href="/Density"
            className="hover:opacity-90 transition-opacity font-medium px-4 py-2 rounded-md hover:bg-white/15"
          >
            Density
          </Link> */}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Search Bar */}
          {/* <div className={`relative transition-all duration-300 ${searchFocus ? "w-72" : "w-56"}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/70" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="w-full bg-white/10 border border-white/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-white/20 focus:border-white/50 rounded-lg px-3 py-2 outline-none transition-all"
            />
          </div> */}

          {/* Notifications */}
          {/* <button className="relative p-2.5 hover:bg-white/15 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span 
                className="text-xs"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  marginTop: '-0.25rem',
                  marginRight: '-0.25rem',
                  height: '1.25rem',
                  minWidth: '1.25rem',
                  backgroundColor: '#fbbf24',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: '0.75rem',
                  lineHeight: '1rem',
                  padding: '0 0.25rem',
                  zIndex: 10
                }}
              >
                {notificationCount}
              </span>
            )}
          </button> */}

          {/* User Menu */}
          <button className="p-2.5 hover:bg-white/15 rounded-lg transition-colors">
            <div className="w-9 h-9 bg-secondary/20 border border-secondary/40 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>

          <button 
            className="font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{
              backgroundColor: '#fbbf24',
              color: '#1e293b'
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Tablet Navbar (md to lg) */}
      <nav 
        className="hidden md:flex lg:hidden items-center justify-between px-6 py-3 text-white shadow-lg sticky top-0 z-40"
        style={{
          background: 'linear-gradient(to right, #1e293b, #dc2626)'
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <div className="flex items-center justify-center text-primary-foreground">
            <Image
              src="/Tazama-logo.png"
              alt="Tazama Pipeline Limited Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
              priority
            />
          </div>
          <span>PipelineFlow</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/15 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 hover:bg-white/15 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span 
                className="text-xs"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  marginTop: '-0.25rem',
                  marginRight: '-0.25rem',
                  height: '1.25rem',
                  minWidth: '1.25rem',
                  backgroundColor: '#fbbf24',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: '0.75rem',
                  lineHeight: '1rem',
                  padding: '0 0.25rem',
                  zIndex: 10
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
          <button className="p-2 hover:bg-white/15 rounded-lg transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/15 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav 
        className="md:hidden flex items-center justify-between px-4 py-3 text-white shadow-lg sticky top-0 z-50"
        style={{
          background: 'linear-gradient(to right, #1e293b, #dc2626)'
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <div className="flex items-center justify-center text-primary-foreground">
            <Image
              src="/Tazama-logo.png"
              alt="Tazama Pipeline Limited Logo"
              width={50}
              height={50}
              className="w-12 h-12 object-contain"
              priority
            />
          </div>
          <span className="text-sm">PipelineFlow</span>
        </Link>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/15 rounded transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 hover:bg-white/15 rounded transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span 
                className="text-xs"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  marginTop: '-0.25rem',
                  marginRight: '-0.25rem',
                  height: '1.25rem',
                  minWidth: '1.25rem',
                  backgroundColor: '#fbbf24',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: '0.75rem',
                  lineHeight: '1rem',
                  padding: '0 0.25rem',
                  zIndex: 10
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/15 rounded transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-foreground shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-70px)] overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 bg-secondary/10 border border-secondary/30 rounded-lg px-3 py-2.5 outline-none text-sm focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Solutions Section */}
            <div>
              <p className="font-bold text-sm mb-4 text-primary uppercase tracking-wide">Solutions</p>
              <div className="space-y-3 ml-2">
                {solutions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block p-3 rounded-lg hover:bg-secondary/10 transition-colors"
                  >
                    <p className="font-semibold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Company Section */}
            <div>
              <p className="font-bold text-sm mb-4 text-primary uppercase tracking-wide">Company</p>
              <div className="space-y-2 ml-2">
                {company.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-sm py-2 hover:text-primary transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Links */}
            <div className="space-y-2">
              <Link href="/ReadingsInput" className="block text-sm py-2 hover:text-primary transition-colors font-medium">
                Readings
              </Link>
              <Link href="/Density" className="block text-sm py-2 hover:text-primary transition-colors font-medium">
                Density
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-6 border-t border-secondary/20">
              <button className="w-full text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground bg-transparent py-2.5 rounded-lg font-bold transition-all duration-200">
                Sign In
              </button>
              <button 
                className="w-full font-bold py-2.5 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#1e293b'
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
