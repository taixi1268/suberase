import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB' }, { status: 400 })
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Supported: MP4, MOV, AVI' }, { status: 400 })
    }

    // Use admin client for storage operations
    const adminSupabase = await createAdminClient()

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'mp4'
    const filename = `${user.id}/${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('videos')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('videos')
      .getPublicUrl(filename)

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
