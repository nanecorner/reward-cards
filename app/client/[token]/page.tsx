import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'

/** Backwards-compatibility redirect: /client/[token] → /[businessSlug]/[token] */
export default async function LegacyClientRedirect({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('public_token, businesses(name)')
    .eq('public_token', token)
    .single()

  if (!client) return notFound()

  const businessName = (client.businesses as any)?.name ?? ''
  const slug = slugify(businessName)

  redirect(`/${slug}/${token}`)
}
