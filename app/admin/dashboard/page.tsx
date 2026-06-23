import { createClient } from '@/lib/supabase/server'
import { Users, QrCode, Gift, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user and business
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user?.id)
    .single()
    
  // Fetch stats (In a real app, you'd want more complex aggregations, but this is an MVP)
  const [{ count: clientsCount }, { count: visitsCount }, { count: rewardsCount }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('business_id', profile?.business_id),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('business_id', profile?.business_id),
    supabase.from('rewards').select('*', { count: 'exact', head: true }).eq('business_id', profile?.business_id).eq('status', 'pending')
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel de Control</h1>
        <p className="text-zinc-400">Bienvenido. Esto es lo que pasa en tu negocio hoy.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Clientes" 
          value={clientsCount || 0} 
          icon={<Users className="w-6 h-6 text-indigo-400" />} 
          trend="+12% desde el mes pasado"
        />
        <MetricCard 
          title="Total Visitas" 
          value={visitsCount || 0} 
          icon={<QrCode className="w-6 h-6 text-emerald-400" />} 
          trend="+24% desde el mes pasado"
        />
        <MetricCard 
          title="Recompensas Pendientes" 
          value={rewardsCount || 0} 
          icon={<Gift className="w-6 h-6 text-amber-400" />} 
          trend="Requiere atención"
        />
      </div>
      
      <div className="mt-12 p-8 border border-zinc-800 rounded-3xl bg-zinc-900/30 glass">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Actividad Reciente</h3>
            <p className="text-zinc-400">Las últimas visitas registradas</p>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
          El gráfico de actividad aparecerá aquí cuando escanees más clientes.
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="p-6 border border-zinc-800 rounded-3xl bg-zinc-900/30 glass hover:bg-zinc-900/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-4xl font-bold tracking-tight mb-2">{value}</div>
      <p className="text-xs text-zinc-500">{trend}</p>
    </div>
  )
}
