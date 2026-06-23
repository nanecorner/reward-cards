import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Phone, Calendar, Copy, ExternalLink, Ticket, Cake, Edit, MessageCircle, Gift, Check } from 'lucide-react'
import { QRGenerator } from '@/components/client/QRGenerator'
import { addVisitAction } from '@/lib/actions/visits'
import { redeemRewardAction } from '@/lib/actions/rewards'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { slugify } from '@/lib/utils'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  // Get client rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('client_id', id)
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  // Get business name for slug-based URL
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', profile.business_id)
    .single()

  const businessSlug = slugify(business?.name || '')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const publicLink = `${baseUrl}/${businessSlug}/${client.public_token}`

  const pendingRewards = rewards?.filter(r => r.status === 'pending') || []
  const redeemedRewards = rewards?.filter(r => r.status === 'redeemed') || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Clientes
        </Link>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <Link href={`/admin/clients/${client.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
        <p className="text-zinc-400">Perfil del Cliente y Tarjeta de Fidelidad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: QR Code & Link */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-zinc-800 flex flex-col items-center text-center">
            <h3 className="font-semibold mb-6">Tarjeta Digital de Fidelidad</h3>
            <div className="transform scale-75 origin-top">
              <QRGenerator value={publicLink} size={200} />
            </div>
            
            <div className="mt-2 w-full">
              <div className="text-sm text-zinc-400 mb-2 text-left font-medium">URL Pública</div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={publicLink} 
                  className="flex-1 min-w-0 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                />
                <button className="shrink-0 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors" title="Copiar URL">
                  <Copy className="w-4 h-4" />
                </button>
                <a 
                  href={`https://wa.me/${client.phone ? client.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(`¡Hola ${client.name.split(' ')[0]}! Aquí tienes tu tarjeta digital de fidelidad: ${publicLink}`)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="shrink-0 p-2 bg-[#25D366]/20 hover:bg-[#25D366]/40 rounded-lg text-[#25D366] transition-colors"
                  title="Enviar por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a 
                  href={publicLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="shrink-0 p-2 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors"
                  title="Abrir Enlace Público"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Rewards & Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-zinc-800/50">
                <span className="text-zinc-400 flex items-center gap-2"><Phone className="w-4 h-4" /> Teléfono</span>
                <span className="font-medium text-white">{client.phone || 'No proporcionado'}</span>
              </div>
              {client.birthday && (
                <div className="flex justify-between py-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 flex items-center gap-2"><Cake className="w-4 h-4" /> Fecha de Nacimiento</span>
                  <span className="font-medium text-white">{new Date(client.birthday).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-zinc-800/50">
                <span className="text-zinc-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Registro</span>
                <span className="font-medium text-white">{new Date(client.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-zinc-800/50">
                <span className="text-zinc-400 flex items-center gap-2"><Ticket className="w-4 h-4" /> Visitas Actuales</span>
                <span className="font-medium text-white text-lg bg-primary/20 text-primary px-3 rounded-full">{client.current_visits}</span>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              Premios y Recompensas
            </h3>

            {pendingRewards.length > 0 ? (
              <div className="space-y-3">
                {pendingRewards.map((reward) => (
                  <div key={reward.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl gap-4">
                    <div>
                      <h4 className="font-bold text-amber-400 text-lg flex items-center gap-2">
                        <Gift className="w-5 h-5 shrink-0" />
                        ¡Corte de Cabello Gratis Listo!
                      </h4>
                      <p className="text-sm text-zinc-300">El cliente ha alcanzado las visitas requeridas.</p>
                    </div>
                    <form action={redeemRewardAction}>
                      <input type="hidden" name="reward_id" value={reward.id} />
                      <input type="hidden" name="client_id" value={client.id} />
                      <SubmitButton className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                        Canjear Premio
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-zinc-400 text-sm">
                No hay premios pendientes por canjear. Sigue acumulando visitas.
              </div>
            )}

            {redeemedRewards.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 mb-3">Historial de Canjes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {redeemedRewards.map((reward) => (
                    <div key={reward.id} className="flex justify-between items-center p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl text-sm">
                      <span className="text-zinc-300 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Corte Gratis Canjeado
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <form action={addVisitAction} className="flex-1">
              <input type="hidden" name="client_id" value={client.id} />
              <SubmitButton className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                Visita Manual +1
              </SubmitButton>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
