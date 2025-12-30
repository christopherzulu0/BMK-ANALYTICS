import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="flex-1 flex flex-col h-full w-full p-0 m-0">
      <div className="w-full flex-1 flex flex-col p-0 m-0">
        <div className="w-full flex-1 flex flex-col h-full p-0 m-0">{children}</div>
      </div>
    </main>
  )
}
