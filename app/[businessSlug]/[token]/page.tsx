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

  const { data: client } = await supabase
    .from('clients')
    .select('*, businesses(name, id, primary_color, secondary_color, text_color, logo_url), rewards(*)')
    .eq('public_token', token)
    .single()

  if (!client) return notFound()

  const business = client.businesses as any
  const businessName = business?.name ?? ''
  const primaryColor = business?.primary_color
  const secondaryColor = business?.secondary_color
  const textColor = business?.text_color
  const logoUrl = business?.logo_url

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
    <div 
      className="min-h-screen bg-primary relative overflow-hidden flex flex-col"
      style={{ color: textColor || 'white' }}
    >
      {(primaryColor || secondaryColor || textColor) && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root, .dark {
              ${primaryColor ? `--primary: ${primaryColor}; --ring: ${primaryColor};` : ''}
              ${secondaryColor ? `--secondary: ${secondaryColor};` : ''}
            }
          `
        }} />
      )}
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col relative z-10 pt-4 pb-8 sm:pt-12 sm:pb-24">

        <header className="text-center mb-6 sm:mb-10 flex flex-col items-center">
          {logoUrl && (
            <div className="w-14 h-14 sm:w-20 sm:h-20 mb-2 sm:mb-4 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 overflow-hidden shrink-0 shadow-[0_0_20px_rgba(var(--secondary),0.2)]">
              <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-secondary font-medium tracking-wide uppercase text-sm mb-2">
            {businessName || 'Programa de Fidelidad'}
          </h2>
          <h1 className="text-3xl font-bold tracking-tight">¡Hola, {client.name.split(' ')[0]}!</h1>
        </header>

        {/* QR Code Section */}
        <div className="glass rounded-[2rem] p-5 sm:p-8 border border-white/10 shadow-2xl flex flex-col items-center mb-4 sm:mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

          <div className="bg-white/10 p-3 rounded-full mb-6">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105 duration-500">
            <QRGenerator value={publicLink} size={150} />
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm mt-4 sm:mt-6 text-center max-w-[200px]">
            Muestra este código QR en la caja para registrar una visita.
          </p>
        </div>

        {/* Stamp Card Section */}
        <div className="glass rounded-[2rem] p-5 sm:p-8 border border-white/10 relative overflow-hidden mb-4 sm:mb-8">
          <div className="text-center mb-6 sm:mb-10">
            <h3 className="font-medium text-xs sm:text-base text-white uppercase tracking-[0.2em] mb-1 sm:mb-2 leading-relaxed">
              Desbloquea tu premio
              <br />
              completando la tarjeta
            </h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 justify-items-center mb-4 sm:mb-6">
            {Array.from({ length: visitsRequired }).map((_, i) => {
              const isStamped = i < currentVisits;
              const isLast = i === visitsRequired - 1;

              return (
                <div 
                  key={i}
                  className={`w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-full flex flex-col items-center justify-center relative transition-all duration-500 ${
                    isStamped 
                      ? 'bg-secondary text-white shadow-[0_0_20px_rgba(var(--secondary),0.3)] scale-105' 
                      : isLast
                        ? 'bg-secondary/90 text-white shadow-lg'
                        : 'border border-white/20 bg-white/5 text-white/40'
                  }`}
                >
                  {isStamped ? (
                    <div className="w-full h-full flex items-center justify-center rounded-full p-2.5 sm:p-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Stamp" className="w-full h-full object-contain drop-shadow-md" />
                      ) : (
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current drop-shadow-md" />
                      )}
                    </div>
                  ) : isLast ? (
                    <span className="font-bold text-[10px] sm:text-sm tracking-widest drop-shadow-md">FREE</span>
                  ) : (
                    <div className="text-[7px] sm:text-[9px] uppercase tracking-[0.15em] text-center leading-tight opacity-70">
                      VIP<br/>Loyalty
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs sm:text-sm text-zinc-400 mt-5 sm:mt-8 font-medium">
            {visitsRemaining > 0
              ? `¡Solo ${visitsRemaining} visitas más para tu ${rewardName.toLowerCase()}!`
              : '¡Has completado tu tarjeta!'}
          </p>
        </div>

        {/* Available Rewards Alert */}
        {pendingRewards.length > 0 && (
          <div className="mt-8 bg-secondary/10 border border-secondary/30 rounded-[2rem] p-6 flex items-start gap-4">
            <div className="bg-secondary/20 p-3 rounded-full text-secondary shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-secondary font-semibold mb-1">¡Recompensa Disponible!</h3>
              <p className="text-sm text-secondary/80">
                Tienes {pendingRewards.length} recompensa{pendingRewards.length > 1 ? 's' : ''} pendiente{pendingRewards.length > 1 ? 's' : ''}. Pide al cajero que la canjee.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
