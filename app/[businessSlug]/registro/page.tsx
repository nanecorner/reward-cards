import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { publicRegisterClientAction } from '@/lib/actions/publicClients'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { QrCode, ArrowRight } from 'lucide-react'

export default async function PublicRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessSlug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { businessSlug } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  // Fetch all businesses and find the one that matches the slug
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, primary_color, secondary_color, text_color, logo_url')

  if (!businesses) return notFound()

  const business = businesses.find((b) => slugify(b.name || '') === businessSlug)

  if (!business) return notFound()

  const primaryColor = business.primary_color
  const secondaryColor = business.secondary_color
  const textColor = business.text_color
  const logoUrl = business.logo_url

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
              ${textColor ? `--foreground: ${textColor};` : ''}
            }
          `
        }} />
      )}
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col relative z-10 pt-4 pb-8 sm:pt-12 sm:pb-24 justify-center">

        <header className="text-center mb-8 flex flex-col items-center">
          {logoUrl ? (
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 overflow-hidden shrink-0 shadow-[0_0_20px_rgba(var(--secondary),0.2)]">
              <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 shrink-0 shadow-[0_0_20px_rgba(var(--secondary),0.2)]">
              <QrCode className="w-8 h-8 sm:w-12 sm:h-12 text-secondary" />
            </div>
          )}
          <h2 className="text-secondary font-medium tracking-wide uppercase text-sm mb-2">
            {business.name}
          </h2>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Obtén tu tarjeta digital</h1>
          <p className="opacity-80 mt-2 text-sm sm:text-base">Regístrate para empezar a acumular visitas y ganar recompensas.</p>
        </header>

        <div className="glass rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
          
          <form action={publicRegisterClientAction} className="space-y-5 relative z-10">
            <input type="hidden" name="businessId" value={business.id} />
            <input type="hidden" name="businessSlug" value={businessSlug} />

            {error && (
              <div className="bg-destructive/20 border border-destructive/50 text-white text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium opacity-90" htmlFor="name">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 placeholder:text-current placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-90" htmlFor="phone">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 placeholder:text-current placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                placeholder="5551234567"
              />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <label className="text-sm font-medium opacity-90" htmlFor="birthday">
                Fecha de Nacimiento <span className="opacity-60 font-normal">(Opcional)</span>
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                className="w-full flex-1 min-w-0 h-12 bg-white/5 border border-white/10 rounded-xl px-4 placeholder:text-current placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                style={{ WebkitAppearance: 'none' }}
              />
            </div>

            <div className="pt-2">
              <SubmitButton
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2"
                loadingText="Registrando..."
              >
                Crear mi tarjeta
                <ArrowRight className="w-4 h-4" />
              </SubmitButton>
            </div>
            
            <p className="text-xs text-center opacity-60 mt-4">
              Al registrarte, guarda el enlace generado para acceder a tu tarjeta digital.
            </p>
          </form>
        </div>

      </main>
    </div>
  )
}
