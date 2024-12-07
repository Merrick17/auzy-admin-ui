import React from 'react'
import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}