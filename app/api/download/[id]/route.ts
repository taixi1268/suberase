import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('result_url, video_url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (error || !task || !task.result_url) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Redirect to the actual file URL
    // In production, you might want to generate a signed URL
    return NextResponse.redirect(task.result_url)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
