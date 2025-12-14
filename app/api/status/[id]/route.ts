import { createClient } from '@/lib/supabase/server'
import { getVideoInpaintingStatus } from '@/lib/replicate'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // If task is still processing, check Replicate status
    if (task.status === 'processing' && task.prediction_id) {
      try {
        const replicateStatus = await getVideoInpaintingStatus(task.prediction_id)

        // Update task status based on Replicate status
        if (replicateStatus.status === 'succeeded' && replicateStatus.output_url) {
          await supabase
            .from('tasks')
            .update({
              status: 'completed',
              result_url: replicateStatus.output_url,
            })
            .eq('id', id)

          return NextResponse.json({
            id: task.id,
            status: 'completed',
            resultUrl: replicateStatus.output_url,
            logs: replicateStatus.logs,
          })
        } else if (replicateStatus.status === 'failed') {
          await supabase
            .from('tasks')
            .update({
              status: 'failed',
              error_message: replicateStatus.error || 'Processing failed',
            })
            .eq('id', id)

          return NextResponse.json({
            id: task.id,
            status: 'failed',
            error: replicateStatus.error || 'Processing failed',
            logs: replicateStatus.logs,
          })
        } else if (replicateStatus.status === 'canceled') {
          await supabase
            .from('tasks')
            .update({
              status: 'canceled',
            })
            .eq('id', id)

          return NextResponse.json({
            id: task.id,
            status: 'canceled',
          })
        }

        // Still processing
        return NextResponse.json({
          id: task.id,
          status: 'processing',
          logs: replicateStatus.logs,
        })
      } catch (replicateError) {
        console.error('Failed to get Replicate status:', replicateError)
        // Return current task status if Replicate query fails
        return NextResponse.json({
          id: task.id,
          status: task.status,
          resultUrl: task.result_url,
          error: task.error_message,
        })
      }
    }

    // Return stored status for completed/failed/canceled tasks
    return NextResponse.json({
      id: task.id,
      status: task.status,
      resultUrl: task.result_url,
      error: task.error_message,
    })
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
