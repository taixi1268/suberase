'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle, Download, RefreshCw, Share2, ArrowLeft, Loader2 } from 'lucide-react'
import { Button, Card } from '@/components/ui'

interface ProcessingData {
  videoName: string
  regions: any[]
  taskId: string
  resultUrl?: string
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations()
  const taskId = params.id as string

  const [showOriginal, setShowOriginal] = useState(false)
  const [processingData, setProcessingData] = useState<ProcessingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    // Get processing data from session storage
    const storedData = sessionStorage.getItem('processingData')
    if (storedData) {
      const data = JSON.parse(storedData) as ProcessingData
      setProcessingData(data)
      setLoading(false)
    } else {
      // Try to fetch from API if no session data
      fetchTaskData()
    }
  }, [taskId])

  const fetchTaskData = async () => {
    try {
      const response = await fetch(`/api/status/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed' && data.resultUrl) {
          setProcessingData({
            videoName: 'video.mp4',
            regions: [],
            taskId: data.id,
            resultUrl: data.resultUrl,
          })
        } else {
          router.push('/upload')
        }
      } else {
        router.push('/upload')
      }
    } catch {
      router.push('/upload')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!processingData?.resultUrl) return

    setDownloading(true)
    try {
      const response = await fetch(processingData.resultUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suberase_${processingData.videoName || 'video.mp4'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download video. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleRetry = () => {
    router.push('/upload')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SubErase - Video Result',
        text: 'Check out my processed video!',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleNewVideo = () => {
    sessionStorage.removeItem('uploadedVideo')
    sessionStorage.removeItem('processingData')
    router.push('/upload')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('result.completeTitle')}
          </h1>
          <p className="text-text-secondary">
            {t('result.completeSubtitle')}
          </p>
        </div>

        {/* Video Result */}
        <div className="mb-8">
          <Card variant="glass" className="p-4">
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showOriginal
                    ? 'bg-primary-blue text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t('result.processed')}
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOriginal
                    ? 'bg-primary-blue text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t('result.original')}
              </button>
            </div>

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              {!showOriginal && processingData?.resultUrl ? (
                <video
                  src={processingData.resultUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-secondary to-bg-tertiary">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <p className="text-text-primary font-medium mb-1">
                      {t('result.originalVideo')}
                    </p>
                    <p className="text-sm text-text-muted">
                      {processingData?.videoName || 'video.mp4'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-text-muted mt-4">
              {showOriginal
                ? t('result.originalDescription')
                : t('result.processedDescription')}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full"
            disabled={!processingData?.resultUrl || downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('result.downloading')}
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                {t('result.downloadVideo')}
              </>
            )}
          </Button>
          <Button onClick={handleRetry} variant="secondary" size="lg" className="w-full">
            <RefreshCw className="w-5 h-5 mr-2" />
            {t('result.processAgain')}
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleNewVideo} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('result.processAnother')}
          </Button>
          <Button onClick={handleShare} variant="ghost">
            <Share2 className="w-4 h-4 mr-2" />
            {t('result.shareResult')}
          </Button>
        </div>

        {/* Processing Details */}
        <div className="mt-12">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('result.summary')}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-primary-blue">
                  {processingData?.regions?.length || 1}
                </p>
                <p className="text-sm text-text-muted">{t('result.regionsProcessed')}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-primary-purple">10</p>
                <p className="text-sm text-text-muted">{t('result.creditsUsed')}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-success">100%</p>
                <p className="text-sm text-text-muted">{t('result.successRate')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tips */}
        <div className="mt-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('result.tipsTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• {t('result.tip1')}</li>
              <li>• {t('result.tip2')}</li>
              <li>• {t('result.tip3')}</li>
              <li>• {t('result.tip4')}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
