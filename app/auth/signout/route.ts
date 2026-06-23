import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if a user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // Redirect to the login page after signing out
  // We use status 303 to ensure the browser converts the POST to a GET request
  return NextResponse.redirect(new URL('/login', request.url), {
    status: 303,
  })
}
