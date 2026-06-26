'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'

export async function publicRegisterClientAction(formData: FormData) {
  const supabase = await createClient()

  const businessId = formData.get('businessId') as string
  const businessSlug = formData.get('businessSlug') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const birthday = formData.get('birthday') as string

  if (!phone || !name || !businessId) {
    redirect(`/${businessSlug}/registro?error=` + encodeURIComponent('El nombre y el teléfono son obligatorios.'))
  }

  // Validate unique phone for this business
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, public_token')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .single()

  if (existingClient) {
    // If they already exist, we could just redirect them to their card!
    redirect(`/${businessSlug}/${existingClient.public_token}`)
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      business_id: businessId,
      name,
      phone,
      birthday: birthday ? birthday : null
    })
    .select('public_token')
    .single()

  if (error || !data) {
    console.error('Error creating public client:', error)
    redirect(`/${businessSlug}/registro?error=` + encodeURIComponent('Error al registrar. Por favor, intenta de nuevo.'))
  }

  // Redirect to their new loyalty card
  redirect(`/${businessSlug}/${data.public_token}`)
}
