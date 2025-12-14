import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already claimed today's bonus
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingClaim } = await supabase
      .from('credit_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'daily_login')
      .gte('created_at', today.toISOString())
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: 'Already claimed today' }, { status: 400 })
    }

    // Add daily bonus credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const newCredits = (userData?.credits ?? 0) + 10

    // Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits, last_login: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the transaction
    await supabase.from('credit_logs').insert({
      user_id: user.id,
      amount: 10,
      type: 'daily_login',
    })

    return NextResponse.json({ credits: newCredits, claimed: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Check if daily bonus is available
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingClaim } = await supabase
      .from('credit_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'daily_login')
      .gte('created_at', today.toISOString())
      .single()

    return NextResponse.json({ canClaim: !existingClaim })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
