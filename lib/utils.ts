import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const VIDEO_CONSTRAINTS = {
  maxSize: 100 * 1024 * 1024, // 100MB
  maxDuration: 180, // 3 minutes
  allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  allowedExtensions: ['.mp4', '.mov', '.avi'],
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!VIDEO_CONSTRAINTS.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file format. Please use MP4, MOV, or AVI.' }
  }
  if (file.size > VIDEO_CONSTRAINTS.maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 100MB.' }
  }
  return { valid: true }
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => reject(new Error('Failed to load video metadata'))
    video.src = URL.createObjectURL(file)
  })
}
