'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addVisitAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()
    
  if (!profile) throw new Error('Profile not found')

  const clientId = formData.get('client_id') as string

  // Insert visit (Triggers in DB will update client current_visits and create rewards)
  const { error } = await supabase
    .from('visits')
    .insert({
      business_id: profile.business_id,
      client_id: clientId
    })

  if (error) {
    console.error('Error adding visit:', error)
    throw new Error('Failed to add visit')
  }

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/clients/${clientId}`)
  redirect(`/admin/clients/${clientId}?success=visit_added`)
}
