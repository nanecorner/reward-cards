import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { addVisitAction } from '@/lib/actions/visits'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function ScanConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) return notFound()

  const supabase = await createClient()

  // Verify auth and get business_id
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user?.id)
    .single()

  if (!profile) return notFound()

  // Find client by token
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!client || client.business_id !== profile.business_id) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 mt-12">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Código QR Inválido</h1>
        <p className="text-zinc-400">Este código QR no pertenece a ningún cliente de tu negocio.</p>
        <Link href="/admin/scan" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-xl transition-all">
          Escanear de Nuevo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 mt-12">
      <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Cliente Encontrado</h1>
      
      <div className="glass p-6 rounded-3xl border border-zinc-800 my-8">
        <h2 className="text-xl font-semibold mb-2">{client.name}</h2>
        <p className="text-zinc-400 mb-4">{client.phone || 'Sin teléfono'}</p>
        <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full font-medium">
          Visitas Actuales: {client.current_visits}
        </div>
      </div>

      <form action={addVisitAction}>
        <input type="hidden" name="client_id" value={client.id} />
        <SubmitButton className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          Confirmar Visita (+1)
        </SubmitButton>
      </form>
      
      <div className="pt-4">
        <Link href="/admin/scan" className="text-zinc-400 hover:text-white transition-colors">
          Cancelar
        </Link>
      </div>
    </div>
  )
}
