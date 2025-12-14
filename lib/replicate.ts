import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
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

export interface VideoInpaintingOutput {
  output_url: string | null
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  error?: string
  logs?: string
}

// ProPainter model for video inpainting
// Using the official ProPainter model
const VIDEO_INPAINTING_MODEL = 'sczhou/propainter'

export async function createVideoInpaintingTask(
  input: VideoInpaintingInput
): Promise<string> {
  try {
    console.log('Creating Replicate prediction with input:', {
      video: input.video_url,
      mask: input.mask_url,
    })

    const prediction = await replicate.predictions.create({
      model: VIDEO_INPAINTING_MODEL,
      input: {
        video: input.video_url,
        mask: input.mask_url,
        // ProPainter parameters
        fp16: true,
        mask_dilation: 8, // Slightly expand mask for better coverage
        flow_mask_dilates: 8,
        neighbor_length: 10,
        ref_stride: 10,
        subvideo_length: 80,
      },
    })

    console.log('Prediction created:', prediction.id)
    return prediction.id
  } catch (error) {
    console.error('Failed to create video inpainting task:', error)
    throw error
  }
}

export async function getVideoInpaintingStatus(
  predictionId: string
): Promise<VideoInpaintingOutput> {
  try {
    const prediction = await replicate.predictions.get(predictionId)

    console.log('Prediction status:', prediction.status, prediction.output)

    return {
      output_url: prediction.output as string | null,
      status: prediction.status as VideoInpaintingOutput['status'],
      error: prediction.error as string | undefined,
      logs: prediction.logs as string | undefined,
    }
  } catch (error) {
    console.error('Failed to get prediction status:', error)
    throw error
  }
}

export async function cancelVideoInpaintingTask(
  predictionId: string
): Promise<void> {
  try {
    await replicate.predictions.cancel(predictionId)
  } catch (error) {
    console.error('Failed to cancel prediction:', error)
    throw error
  }
}

// Generate a simple PNG mask image as base64 data URL
// The mask should be black background with white rectangles where subtitles are
export function generateMaskDataUrl(
  videoWidth: number,
  videoHeight: number,
  regions: Region[]
): string {
  // Create a simple BMP-like structure for the mask
  // For simplicity, we'll create a PNG using a minimal approach

  // Since we're in Node.js environment and can't use Canvas directly,
  // we'll create a simple SVG and convert it to data URL
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

// Utility to poll for completion
export async function waitForCompletion(
  predictionId: string,
  onProgress?: (status: string, logs?: string) => void,
  maxAttempts = 180, // 15 minutes with 5 second intervals
  interval = 5000
): Promise<VideoInpaintingOutput> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const result = await getVideoInpaintingStatus(predictionId)

    if (onProgress) {
      onProgress(result.status, result.logs)
    }

    if (result.status === 'succeeded' || result.status === 'failed' || result.status === 'canceled') {
      return result
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
    attempts++
  }

  throw new Error('Prediction timed out')
}
