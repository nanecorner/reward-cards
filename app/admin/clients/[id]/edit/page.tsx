import { updateClientAction } from '@/lib/actions/clients'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sParams = await searchParams
  const supabase = await createClient()

  // Verify auth and get business_id
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user?.id)
    .single()

  if (!profile) return notFound()

  // Get client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('business_id', profile.business_id)
    .single()

  if (!client) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href={`/admin/clients/${client.id}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Detalles
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Editar Cliente</h1>
        <p className="text-zinc-400">Actualizar información de {client.name}.</p>
      </div>

      <div className="glass rounded-3xl p-8 border border-zinc-800">
        <form action={updateClientAction} className="space-y-6">
          {sParams?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm p-3 rounded-xl mb-6">
              {sParams.error}
            </div>
          )}
          <input type="hidden" name="id" value={client.id} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="name">
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={client.name}
              className="w-full h-[52px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="phone">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={client.phone || ''}
              className="w-full h-[52px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="birthday">
              Fecha de Nacimiento <span className="text-zinc-500 font-normal">(Opcional)</span>
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              defaultValue={client.birthday ? new Date(client.birthday).toISOString().split('T')[0] : ''}
              className="w-full h-[52px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Link 
              href={`/admin/clients/${client.id}`}
              className="px-6 py-3 rounded-xl font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Cancelar
            </Link>
            <SubmitButton
              className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-xl"
              loadingText="Guardando..."
            >
              Guardar Cambios
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
