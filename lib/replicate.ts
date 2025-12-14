import Replicate from 'replicate'
import sharp from 'sharp'

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
// https://replicate.com/jd7h/propainter
// Supports static image mask - perfect for subtitle removal
const VIDEO_INPAINTING_MODEL = 'jd7h/propainter'

export async function createVideoInpaintingTask(
  input: VideoInpaintingInput
): Promise<string> {
  try {
    console.log('Creating Replicate prediction with input:', {
      video: input.video_url,
      mask: input.mask_url,
    })

    // Use replicate.run() which handles version selection automatically
    // Then we need to create a prediction to get the ID for status tracking
    const prediction = await replicate.predictions.create({
      // Use the specific version hash from jd7h/propainter
      version: "b3e1ec853a25dbbd5178128139eb773612924c7f032c9919c20c254e6813a5ad",
      input: {
        video: input.video_url,
        mask: input.mask_url,
        // ProPainter parameters for better quality
        fp16: true,                    // Use half precision for faster processing
        resize_ratio: 1.0,             // Keep original resolution
        mask_dilation: 4,              // Slightly expand mask for better coverage
        neighbor_length: 10,           // Number of local neighbors
        ref_stride: 10,                // Reference stride for global references
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

// Generate a PNG mask image as Buffer
// The mask should be black background with white rectangles where subtitles are
// ProPainter expects: white = area to inpaint, black = keep original
export async function generateMaskPng(
  videoWidth: number,
  videoHeight: number,
  regions: Region[]
): Promise<Buffer> {
  // Create SVG first, then convert to PNG using sharp
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${videoWidth}" height="${videoHeight}">
      <rect width="100%" height="100%" fill="black"/>
      ${regions.map(r => `
        <rect x="${Math.round(r.x)}" y="${Math.round(r.y)}" width="${Math.round(r.width)}" height="${Math.round(r.height)}" fill="white"/>
      `).join('')}
    </svg>
  `.trim()

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return pngBuffer
}

// Legacy function for compatibility - returns data URL (deprecated)
export function generateMaskDataUrl(
  videoWidth: number,
  videoHeight: number,
  regions: Region[]
): string {
  // Create SVG mask - black background with white rectangles for subtitle areas
  // ProPainter expects: white = area to inpaint, black = keep original
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
