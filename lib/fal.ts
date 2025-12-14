import { fal } from '@fal-ai/client'

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
})

export interface Region {
  x: number
  y: number
  width: number
  height: number
}

export interface VideoInpaintingInput {
  video_url: string
  mask_url: string
}

export interface VideoInpaintingResult {
  requestId: string
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  output_url?: string
  error?: string
}

// Generate a PNG mask image as base64 data URL
export function generateMaskDataUrl(
  videoWidth: number,
  videoHeight: number,
  regions: Region[]
): string {
  // Create an SVG mask - black background with white rectangles for subtitle areas
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${videoWidth}" height="${videoHeight}">
      <rect width="100%" height="100%" fill="black"/>
      ${regions.map(r => `
        <rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="white"/>
      `).join('')}
    </svg>
  `.trim()

  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// Start video inpainting task using fal.ai Wan VACE 14B
export async function createVideoInpaintingTask(
  input: VideoInpaintingInput
): Promise<string> {
  try {
    console.log('Creating fal.ai video inpainting task:', {
      video: input.video_url,
      mask: input.mask_url,
    })

    // Submit the task to fal.ai queue
    // Using type assertion because SDK types may not include all parameters
    const result = await fal.queue.submit('fal-ai/wan-vace-14b/inpainting', {
      input: {
        video_url: input.video_url,
        // Use guiding_mask_url - fal.ai will track this static mask through the video
        guiding_mask_url: input.mask_url,
        // Prompt to guide the inpainting
        prompt: 'clean video without text, subtitles removed, natural background restoration',
        // Negative prompt - remove unwanted elements
        negative_prompt: 'subtitles, watermark, text, logo, captions, letters, words, characters, letterboxing, borders, black bars, bright colors, overexposed, static, blurred details, low quality',
        // Number of inference steps
        num_inference_steps: 30,
        // Guidance scale
        guidance_scale: 5,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    console.log('Fal.ai task submitted:', result.request_id)
    return result.request_id
  } catch (error) {
    console.error('Failed to create video inpainting task:', error)
    throw error
  }
}

// Get the status and result of a video inpainting task
export async function getVideoInpaintingStatus(
  requestId: string
): Promise<VideoInpaintingResult> {
  try {
    const status = await fal.queue.status('fal-ai/wan-vace-14b/inpainting', {
      requestId,
      logs: true,
    })

    console.log('Task status:', status.status)

    if (status.status === 'COMPLETED') {
      // Get the result
      const result = await fal.queue.result('fal-ai/wan-vace-14b/inpainting', {
        requestId,
      })

      const output = result.data as { video?: { url: string } }

      return {
        requestId,
        status: 'COMPLETED',
        output_url: output.video?.url,
      }
    }

    return {
      requestId,
      status: status.status as VideoInpaintingResult['status'],
    }
  } catch (error) {
    console.error('Failed to get task status:', error)
    return {
      requestId,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Cancel a video inpainting task
export async function cancelVideoInpaintingTask(
  requestId: string
): Promise<void> {
  try {
    await fal.queue.cancel('fal-ai/wan-vace-14b/inpainting', {
      requestId,
    })
  } catch (error) {
    console.error('Failed to cancel task:', error)
    throw error
  }
}
