import { ReactNode } from 'react'
import Link from 'next/link'
import { QrCode, Users, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user?.id)
    .single()

  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', profile?.business_id)
    .single()

  const businessName = business?.name || 'Loyalty QR'

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <QrCode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight leading-tight block">{businessName}</span>
            <span className="text-xs text-zinc-500">Panel de administración</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Panel de Control</span>
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <Users className="w-5 h-5" />
            <span className="font-medium">Clientes</span>
          </Link>
          <Link href="/admin/scan" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
            <QrCode className="w-5 h-5" />
            <span className="font-medium">Escanear QR</span>
          </Link>
        </nav>

        <div className="mt-auto">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
