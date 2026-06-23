'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()
    
  if (!profile) throw new Error('Profile not found')

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const birthday = formData.get('birthday') as string

  if (!phone) {
    redirect('/admin/clients/new?error=' + encodeURIComponent('El teléfono es obligatorio.'))
  }

  // Validate unique phone
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('business_id', profile.business_id)
    .eq('phone', phone)
    .single()

  if (existingClient) {
    redirect('/admin/clients/new?error=' + encodeURIComponent('Este teléfono ya está registrado.'))
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      business_id: profile.business_id,
      name,
      phone,
      birthday: birthday ? birthday : null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    redirect('/admin/clients/new?error=' + encodeURIComponent('Error al registrar el cliente.'))
  }

  revalidatePath('/admin/clients')
  redirect(`/admin/clients/${data.id}`)
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()
    
  if (!profile) throw new Error('Profile not found')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const birthday = formData.get('birthday') as string

  if (!phone) {
    redirect(`/admin/clients/${id}/edit?error=` + encodeURIComponent('El teléfono es obligatorio.'))
  }

  // Validate unique phone
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('business_id', profile.business_id)
    .eq('phone', phone)
    .neq('id', id)
    .single()

  if (existingClient) {
    redirect(`/admin/clients/${id}/edit?error=` + encodeURIComponent('Este teléfono ya está registrado por otro cliente.'))
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      phone,
      birthday: birthday ? birthday : null
    })
    .eq('id', id)
    .eq('business_id', profile.business_id)

  if (error) {
    console.error('Error updating client:', error)
    throw new Error('Failed to update client')
  }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${id}`)
  redirect(`/admin/clients/${id}`)
}

