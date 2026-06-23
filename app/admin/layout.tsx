import { ReactNode } from 'react'
import { QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

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
    .select('name, primary_color, secondary_color, logo_url')
    .eq('id', profile?.business_id)
    .single()

  const businessName = business?.name || 'Loyalty QR'

  return (
    <AdminLayoutClient 
      businessName={businessName}
      primaryColor={business?.primary_color}
      secondaryColor={business?.secondary_color}
      logoUrl={business?.logo_url}
    >
      {children}
    </AdminLayoutClient>
  )
}

