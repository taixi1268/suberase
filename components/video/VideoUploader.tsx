'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'
import { Upload, FileVideo, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { cn, validateVideoFile, formatFileSize, getVideoDuration, VIDEO_CONSTRAINTS } from '@/lib/utils'

interface VideoUploaderProps {
  onUploadComplete: (file: File, videoUrl: string) => void
  disabled?: boolean
}

export function VideoUploader({ onUploadComplete, disabled }: VideoUploaderProps) {
  const t = useTranslations('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setError(null)

    // Validate file
    const validation = validateVideoFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    // Check duration
    try {
      const duration = await getVideoDuration(selectedFile)
      if (duration > VIDEO_CONSTRAINTS.maxDuration) {
        setError(`Video too long. Maximum duration is ${VIDEO_CONSTRAINTS.maxDuration / 60} minutes.`)
        return
      }
    } catch (err) {
      setError('Could not read video file')
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress (replace with actual upload logic)
      const formData = new FormData()
      formData.append('file', file)

      // For demo, we'll just create a local URL
      // In production, upload to Supabase Storage
      const videoUrl = preview || ''

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setProgress(i)
      }

      onUploadComplete(file, videoUrl)
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer',
                isDragActive
                  ? 'border-primary-blue bg-primary-blue/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5',
                (disabled || uploading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-purple to-primary-cyan p-4 mb-6">
                  <Upload className="w-full h-full text-white" />
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t('dragDrop')}
                </h3>
                <p className="text-text-muted mb-4">{t('or')}</p>
                <Button variant="secondary" size="sm" type="button">
                  {t('browse')}
                </Button>

                <div className="mt-6 text-sm text-text-muted">
                  <p>{t('supported')}</p>
                  <p>{t('maxSize')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
              <video
                src={preview || undefined}
                className="w-full h-full object-contain"
                controls
              />
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* File Info */}
            <div className="flex items-center gap-3 mb-4">
              <FileVideo className="w-8 h-8 text-primary-blue" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {file.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="mb-4">
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-purple to-primary-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-text-muted text-center mt-2">
                  {t('uploading')} {progress}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleRemove}
                disabled={uploading}
                className="flex-1"
              >
                {t('browse')}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-error text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
