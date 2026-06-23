import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QRGenerator } from '@/components/client/QRGenerator'
import { QrCode, Star, Trophy } from 'lucide-react'
import { slugify } from '@/lib/utils'

export default async function PublicClientPage({
  params,
}: {
  params: Promise<{ businessSlug: string; token: string }>
}) {
  const { businessSlug, token } = await params
  const supabase = await createClient()

  // Find client by token (token is globally unique)
  const { data: client } = await supabase
    .from('clients')
    .select('*, businesses(name, id), rewards(*)')
    .eq('public_token', token)
    .single()

  if (!client) return notFound()

  const businessName = (client.businesses as any)?.name ?? ''
  const correctSlug = slugify(businessName)

  // Redirect if slug doesn't match (e.g. old QR codes)
  if (businessSlug !== correctSlug) {
    redirect(`/${correctSlug}/${token}`)
  }

  // Loyalty program
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', client.business_id)
    .single()

  const visitsRequired = program?.visits_required || 10
  const rewardName = program?.reward_name || 'Recompensa Gratis'

  const currentVisits = client.current_visits
  const visitsRemaining = Math.max(0, visitsRequired - currentVisits)
  const progressPercentage = Math.min(100, Math.round((currentVisits / visitsRequired) * 100))

  const pendingRewards = client.rewards.filter((r: any) => r.status === 'pending')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const publicLink = `${baseUrl}/${correctSlug}/${client.public_token}`

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col relative z-10 pt-12 pb-24">

        <header className="text-center mb-10">
          <h2 className="text-primary font-medium tracking-wide uppercase text-sm mb-2">
            {businessName || 'Programa de Fidelidad'}
          </h2>
          <h1 className="text-3xl font-bold tracking-tight">¡Hola, {client.name.split(' ')[0]}!</h1>
        </header>

        {/* QR Code Section */}
        <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-2xl flex flex-col items-center mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

          <div className="bg-white/10 p-3 rounded-full mb-6">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105 duration-500">
            <QRGenerator value={publicLink} size={200} />
          </div>

          <p className="text-zinc-400 text-sm mt-6 text-center max-w-[200px]">
            Muestra este código QR en la caja para registrar una visita.
          </p>
        </div>

        {/* Progress Section */}
        <div className="glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Progreso de Fidelidad
              </h3>
              <p className="text-zinc-400 text-sm mt-1">{rewardName}</p>
            </div>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              {currentVisits}<span className="text-lg text-zinc-500 font-medium">/{visitsRequired}</span>
            </div>
          </div>

          <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="text-center text-sm text-zinc-400">
            {visitsRemaining > 0
              ? `¡Solo ${visitsRemaining} visitas más para tu recompensa!`
              : '¡Has alcanzado tu meta!'}
          </p>
        </div>

        {/* Available Rewards Alert */}
        {pendingRewards.length > 0 && (
          <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] p-6 flex items-start gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-semibold mb-1">¡Recompensa Disponible!</h3>
              <p className="text-sm text-emerald-500/80">
                Tienes {pendingRewards.length} recompensa{pendingRewards.length > 1 ? 's' : ''} pendiente{pendingRewards.length > 1 ? 's' : ''}. Pide al cajero que la canjee.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
