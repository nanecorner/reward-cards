'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QrCode, Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'

export function AdminLayoutClient({
  children,
  businessName,
}: {
  children: ReactNode
  businessName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/admin/dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { href: '/admin/clients', label: 'Clientes', icon: Users },
    { href: '/admin/scan', label: 'Escanear QR', icon: QrCode },
  ]

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <QrCode className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight leading-tight block">{businessName}</span>
            <span className="text-[10px] text-zinc-500">Panel Admin</span>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 -mr-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <QrCode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight leading-tight block">{businessName}</span>
            <span className="text-xs text-zinc-500">Panel de administración</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 mt-16 md:mt-0">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900 md:border-none">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 min-h-[calc(100vh-65px)] md:h-screen">
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
