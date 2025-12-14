'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { Link } from '@/navigation'
import { ArrowLeft, Trash2, Play, Coins, Loader2 } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { RegionSelector, type Region } from '@/components/video/RegionSelector'
import { videoStore } from '@/lib/videoStore'

export default function EditPageClient() {
  const t = useTranslations('edit')
  const tCommon = useTranslations('common')
  const tCredits = useTranslations('credits')
  const router = useRouter()

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('')
  const [regions, setRegions] = useState<Region[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [credits] = useState(90) // Demo credits

  // Load video from global store
  useEffect(() => {
    const storedVideo = videoStore.getVideo()
    if (storedVideo) {
      setVideoUrl(storedVideo.url)
      setVideoName(storedVideo.name)
    } else {
      // No video, redirect to upload
      router.push('/upload')
    }
  }, [router])

  const handleDeleteRegion = (id: string) => {
    setRegions(regions.filter((r) => r.id !== id))
  }

  const handleProcess = async () => {
    if (regions.length === 0) return

    setIsProcessing(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Store processing data
    sessionStorage.setItem('processingData', JSON.stringify({
      videoUrl,
      videoName,
      regions,
    }))

    // Navigate to processing page
    router.push('/processing/demo')
  }

  if (!videoUrl) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-warning" />
            <span className="text-text-primary font-medium">{credits}</span>
            <span className="text-text-muted">{tCredits('balance')}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Video Editor */}
          <div>
            <Card variant="glass" className="p-4">
              <RegionSelector
                videoUrl={videoUrl}
                regions={regions}
                onRegionsChange={setRegions}
                disabled={isProcessing}
              />

              {/* Video Name */}
              <p className="mt-4 text-sm text-text-muted truncate">
                {videoName}
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {t('instructions')}
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>{t('step1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>{t('step2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>{t('step3')}</span>
                </li>
              </ul>
            </Card>

            {/* Selected Regions */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {t('selectedRegions')} ({regions.length})
              </h3>

              {regions.length === 0 ? (
                <p className="text-sm text-text-muted">
                  {t('noRegions')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {regions.map((region, index) => (
                    <li
                      key={region.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <span className="text-sm text-text-secondary">
                        {t('region')} {index + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteRegion(region.id)}
                        className="p-1 text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Process Button */}
            <div className="space-y-3">
              <Button
                onClick={handleProcess}
                disabled={regions.length === 0 || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t('startProcessing')}
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-text-muted">
                {t('creditCost')} <span className="text-warning font-medium">10 {t('credits')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
