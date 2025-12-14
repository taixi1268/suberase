import { createClient } from '@/lib/supabase/server'

export interface CreditOperation {
  userId: string
  amount: number
  type: 'register' | 'daily_login' | 'process' | 'refund' | 'purchase'
}

export async function addCredits({ userId, amount, type }: CreditOperation) {
  const supabase = await createClient()

  // Get current credits
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (userError) throw userError

  const newCredits = (userData?.credits ?? 0) + amount

  // Update credits
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId)

  if (updateError) throw updateError

  // Log transaction
  await supabase.from('credit_logs').insert({
    user_id: userId,
    amount,
    type,
  })

  return newCredits
}

export async function deductCredits({ userId, amount, type }: CreditOperation) {
  const supabase = await createClient()

  // Get current credits
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (userError) throw userError

  const currentCredits = userData?.credits ?? 0

  if (currentCredits < amount) {
    throw new Error('Insufficient credits')
  }

  const newCredits = currentCredits - amount

  // Update credits
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId)

  if (updateError) throw updateError

  // Log transaction (negative amount for deduction)
  await supabase.from('credit_logs').insert({
    user_id: userId,
    amount: -amount,
    type,
  })

  return newCredits
}

export async function getCredits(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) throw error

  return data?.credits ?? 0
}

export async function hasEnoughCredits(userId: string, required: number) {
  const credits = await getCredits(userId)
  return credits >= required
}

// Cost constants
export const CREDIT_COSTS = {
  PROCESS_VIDEO: 10,
} as const
