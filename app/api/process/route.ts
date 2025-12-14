import { createClient, createAdminClient } from '@/lib/supabase/server'
import { deductCredits, hasEnoughCredits, CREDIT_COSTS } from '@/lib/credits'
import { createVideoInpaintingTask, generateMaskDataUrl, Region } from '@/lib/replicate'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User ID:', user.id)

    // Use admin client for database operations to bypass RLS
    const adminSupabase = await createAdminClient()

    // Check if user exists in users table, create if not
    let { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id, credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // Auto-create user with initial credits
      console.log('Creating new user:', user.id)
      const { data: newUser, error: createError } = await adminSupabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: user.user_metadata?.avatar_url,
          credits: 100,
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      // Log initial credits
      await adminSupabase.from('credit_logs').insert({
        user_id: user.id,
        amount: 100,
        type: 'register',
      })

      userData = newUser
    }

    // Ensure userData is not null
    if (!userData) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 })
    }

    console.log('User credits:', userData.credits)

    // Check credits
    if (userData.credits < CREDIT_COSTS.PROCESS_VIDEO) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    const body = await request.json()
    const { videoUrl, regions, videoWidth, videoHeight } = body as {
      videoUrl: string
      regions: Region[]
      videoWidth: number
      videoHeight: number
    }

    if (!videoUrl || !regions || regions.length === 0) {
      return NextResponse.json({ error: 'Invalid request: missing video URL or regions' }, { status: 400 })
    }

    if (!videoWidth || !videoHeight) {
      return NextResponse.json({ error: 'Invalid request: missing video dimensions' }, { status: 400 })
    }

    // Generate mask image
    const maskDataUrl = generateMaskDataUrl(videoWidth, videoHeight, regions)

    // Upload mask to Supabase Storage
    const timestamp = Date.now()
    const maskFilename = `${user.id}/masks/${timestamp}.svg`

    // Convert data URL to buffer for upload
    const maskBase64 = maskDataUrl.split(',')[1]
    const maskBuffer = Buffer.from(maskBase64, 'base64')

    const { error: maskUploadError } = await adminSupabase.storage
      .from('videos')
      .upload(maskFilename, maskBuffer, {
        contentType: 'image/svg+xml',
        upsert: true,
      })

    if (maskUploadError) {
      console.error('Mask upload error:', maskUploadError)
      return NextResponse.json({ error: 'Failed to upload mask' }, { status: 500 })
    }

    // Get mask public URL
    const { data: maskUrlData } = adminSupabase.storage
      .from('videos')
      .getPublicUrl(maskFilename)

    const maskUrl = maskUrlData.publicUrl
    console.log('Mask URL:', maskUrl)

    // Create task record using admin client
    const { data: task, error: taskError } = await adminSupabase
      .from('tasks')
      .insert({
        user_id: user.id,
        video_url: videoUrl,
        mask_data: { regions, maskUrl, videoWidth, videoHeight },
        status: 'pending',
      })
      .select()
      .single()

    if (taskError) {
      console.error('Task creation error:', taskError)
      return NextResponse.json({ error: taskError.message }, { status: 500 })
    }

    console.log('Task created:', task.id)

    try {
      // Create Replicate prediction using ProPainter model
      const predictionId = await createVideoInpaintingTask({
        video_url: videoUrl,
        mask_url: maskUrl,
      })

      console.log('Replicate prediction created:', predictionId)

      // Update task with prediction ID
      await adminSupabase
        .from('tasks')
        .update({
          status: 'processing',
          prediction_id: predictionId,
        })
        .eq('id', task.id)

      // Deduct credits
      await adminSupabase
        .from('users')
        .update({ credits: userData.credits - CREDIT_COSTS.PROCESS_VIDEO })
        .eq('id', user.id)

      // Log credit transaction
      await adminSupabase.from('credit_logs').insert({
        user_id: user.id,
        amount: -CREDIT_COSTS.PROCESS_VIDEO,
        type: 'process',
      })

      return NextResponse.json({
        taskId: task.id,
        predictionId,
        status: 'processing',
        message: 'Processing started',
      })
    } catch (replicateError) {
      // If Replicate fails, update task status
      await adminSupabase
        .from('tasks')
        .update({ status: 'failed', error_message: String(replicateError) })
        .eq('id', task.id)

      console.error('Replicate error:', replicateError)
      return NextResponse.json({ error: 'Failed to start processing' }, { status: 500 })
    }
  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
