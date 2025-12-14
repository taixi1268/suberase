import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Use admin client to bypass RLS for user creation
      const adminSupabase = await createAdminClient()

      // Check if user exists in our users table
      const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // If new user, create profile with initial credits
      if (!existingUser) {
        await adminSupabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
          credits: 100, // Initial credits for new users
        })

        // Log the credit transaction
        await adminSupabase.from('credit_logs').insert({
          user_id: data.user.id,
          amount: 100,
          type: 'register',
        })
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
