import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientsTable } from '@/components/admin/ClientsTable'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user?.id)
    .single()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone, current_visits, created_at')
    .eq('business_id', profile?.business_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Clientes</h1>
          <p className="text-zinc-400">
            Administra los miembros de tu programa de fidelidad.
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/40"
        >
          <Plus className="w-5 h-5" />
          Añadir Cliente
        </Link>
      </div>

      <div className="glass rounded-3xl p-6 border border-zinc-800">
        <ClientsTable clients={clients ?? []} />
      </div>
    </div>
  )
}
