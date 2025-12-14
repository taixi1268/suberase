'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileVideo, X, Loader2, Trash2, Play, Coins } from 'lucide-react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { RegionSelector, type Region } from '@/components/video/RegionSelector'
import { cn, validateVideoFile, formatFileSize } from '@/lib/utils'

export default function UploadPage() {
  const t = useTranslations('upload')
  const tCommon = useTranslations('common')
  const tCredits = useTranslations('credits')
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [step, setStep] = useState<'upload' | 'edit'>('upload')
  const [regions, setRegions] = useState<Region[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [credits] = useState(100)

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFile = async (selectedFile: File) => {
    setError(null)
    const validation = validateVideoFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const handleContinue = () => {
    if (!file || !preview) return
    setStep('edit')
  }

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setError(null)
    setStep('upload')
    setRegions([])
  }

  const handleDeleteRegion = (id: string) => {
    setRegions(regions.filter((r) => r.id !== id))
  }

  const handleProcess = async () => {
    if (regions.length === 0 || !file || !preview) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || 'Failed to upload video')
      }

      const uploadData = await uploadResponse.json()
      const videoUrl = uploadData.url

      const videoElement = document.querySelector('video')
      const videoWidth = videoElement?.videoWidth || 1920
      const videoHeight = videoElement?.videoHeight || 1080

      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          regions: regions.map(r => ({ x: r.x, y: r.y, width: r.width, height: r.height })),
          videoWidth,
          videoHeight,
        }),
      })

      if (!processResponse.ok) {
        const processError = await processResponse.json()
        throw new Error(processError.error || 'Failed to start processing')
      }

      const processData = await processResponse.json()

      sessionStorage.setItem('processingData', JSON.stringify({
        videoName: file.name,
        regions,
        taskId: processData.taskId,
        predictionId: processData.predictionId,
      }))

      router.push(`/processing/${processData.taskId}`)
    } catch (err) {
      console.error('Processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process video')
      setIsProcessing(false)
    }
  }

  if (step === 'upload') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container-custom max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t('title')}</h1>
            <p className="text-text-secondary">{t('supported')} · {t('maxSize')}</p>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer',
                dragActive ? 'border-primary-blue bg-primary-blue/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              )}
            >
              <input type="file" accept="video/mp4,video/quicktime,video/x-msvideo" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-purple to-primary-cyan p-4 mb-6">
                  <Upload className="w-full h-full text-white" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('dragDrop')}</h3>
                <p className="text-text-muted mb-4">{t('or')}</p>
                <Button variant="secondary" size="sm" type="button">{t('browse')}</Button>
                <div className="mt-6 text-sm text-text-muted">
                  <p>{t('supported')}</p>
                  <p>{t('maxSize')}</p>
                </div>
              </div>
            </div>
          ) : (
            <Card variant="glass" className="p-6">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
                <video src={preview || undefined} className="w-full h-full object-contain" controls />
                <button onClick={handleRemove} className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <FileVideo className="w-8 h-8 text-primary-blue" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleRemove} className="flex-1">Change File</Button>
                <Button onClick={handleContinue} className="flex-1">Continue</Button>
              </div>
            </Card>
          )}

          {error && <p className="mt-4 text-sm text-error text-center">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep('upload')} className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-warning" />
            <span className="text-text-primary font-medium">{credits}</span>
            <span className="text-text-muted">{tCredits('balance')}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <div>
            <Card variant="glass" className="p-4">
              {preview && <RegionSelector videoUrl={preview} regions={regions} onRegionsChange={setRegions} disabled={isProcessing} />}
              <p className="mt-4 text-sm text-text-muted truncate">{file?.name}</p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Instructions</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  <span>Pause the video where subtitles are visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  <span>Draw a rectangle around the subtitle area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  <span>Click "Start Processing" when ready</span>
                </li>
              </ul>
            </Card>

            <Card variant="glass">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Selected Regions ({regions.length})</h3>
              {regions.length === 0 ? (
                <p className="text-sm text-text-muted">No regions selected. Draw a rectangle on the video to mark the subtitle area.</p>
              ) : (
                <ul className="space-y-2">
                  {regions.map((region, index) => (
                    <li key={region.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-sm text-text-secondary">Region {index + 1}</span>
                      <button onClick={() => handleDeleteRegion(region.id)} className="p-1 text-text-muted hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-3">
              <Button onClick={handleProcess} disabled={regions.length === 0 || isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><Play className="w-5 h-5 mr-2" />Start Processing</>
                )}
              </Button>
              <p className="text-center text-sm text-text-muted">
                This will use <span className="text-warning font-medium">10 credits</span>
              </p>
              {error && <p className="text-sm text-error text-center">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
