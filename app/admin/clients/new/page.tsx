import { createClientAction } from '@/lib/actions/clients'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Clientes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Nuevo Cliente</h1>
        <p className="text-zinc-400">Registra un nuevo cliente para tu programa de fidelidad.</p>
      </div>

      <div className="glass rounded-3xl p-8 border border-zinc-800">
        <form action={createClientAction} className="space-y-6">
          {params?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm p-3 rounded-xl mb-6">
              {params.error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="name">
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              placeholder="John Doe"
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
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              placeholder="+1 234 567 8900"
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
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Link 
              href="/admin/clients"
              className="px-6 py-3 rounded-xl font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Cancelar
            </Link>
            <SubmitButton
              className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-xl"
              loadingText="Registrando..."
            >
              Registrar Cliente
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
