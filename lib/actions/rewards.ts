'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function redeemRewardAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const rewardId = formData.get('reward_id') as string
  const clientId = formData.get('client_id') as string

  const { error } = await supabase
    .from('rewards')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString()
    })
    .eq('id', rewardId)
    .eq('business_id', profile.business_id)

  if (error) {
    console.error('Error redeeming reward:', error)
    throw new Error('Failed to redeem reward')
  }

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/clients/${clientId}`)
}
