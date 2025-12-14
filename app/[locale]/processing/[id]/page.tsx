'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, Button } from '@/components/ui'

interface ProcessingStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
  resultUrl?: string
  error?: string
  logs?: string
}

const processingSteps = [
  { id: 'upload', label: 'Video uploaded' },
  { id: 'detect', label: 'Analyzing frames' },
  { id: 'process', label: 'Removing subtitles' },
  { id: 'render', label: 'Rendering output' },
]

export default function ProcessingPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string>('')

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/status/${taskId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }

      const data: ProcessingStatus = await response.json()
      setStatus(data)

      if (data.logs) {
        setLogs(data.logs)
        // Update step based on logs
        if (data.logs.includes('Rendering') || data.logs.includes('output')) {
          setCurrentStep(3)
        } else if (data.logs.includes('Removing') || data.logs.includes('inpaint')) {
          setCurrentStep(2)
        } else if (data.logs.includes('Analyzing') || data.logs.includes('frame')) {
          setCurrentStep(1)
        } else {
          setCurrentStep(0)
        }
      }

      if (data.status === 'completed' && data.resultUrl) {
        // Store result data
        const processingData = sessionStorage.getItem('processingData')
        if (processingData) {
          const existingData = JSON.parse(processingData)
          sessionStorage.setItem('processingData', JSON.stringify({
            ...existingData,
            resultUrl: data.resultUrl,
          }))
        }
        // Navigate to result page
        router.push(`/result/${taskId}`)
      } else if (data.status === 'failed') {
        setError(data.error || 'Processing failed')
      } else if (data.status === 'canceled') {
        setError('Processing was canceled')
      }

      return data.status
    } catch (err) {
      console.error('Status polling error:', err)
      return null
    }
  }, [taskId, router])

  useEffect(() => {
    // Check if we have processing data
    const processingData = sessionStorage.getItem('processingData')
    if (!processingData) {
      router.push('/upload')
      return
    }

    // Start polling
    const poll = async () => {
      const currentStatus = await pollStatus()
      if (currentStatus === 'processing' || currentStatus === 'pending') {
        // Continue polling every 3 seconds
        setTimeout(poll, 3000)
      }
    }

    poll()
  }, [router, pollStatus])

  const handleRetry = () => {
    router.push('/upload')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container-custom max-w-lg">
        <div className="animate-fade-in">
          <Card variant="glass" className="p-8 text-center">
            {/* Status Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              {error ? (
                <div className="absolute inset-0 rounded-full bg-error/20 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-error" />
                </div>
              ) : status?.status === 'completed' ? (
                <div className="absolute inset-0 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-purple to-primary-cyan opacity-20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-bg-secondary flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-blue animate-spin" />
                  </div>
                </>
              )}
            </div>

            {error ? (
              <>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Processing Failed
                </h1>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={handleRetry}>Try Again</Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Processing Your Video
                </h1>
                <p className="text-text-secondary mb-8">
                  This may take a few minutes depending on video length
                </p>

                {/* Steps */}
                <div className="space-y-3 text-left mb-6">
                  {processingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3"
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      ) : index === currentStep ? (
                        <Loader2 className="w-5 h-5 text-primary-blue animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-text-muted flex-shrink-0" />
                      )}
                      <span
                        className={
                          index <= currentStep
                            ? 'text-text-primary'
                            : 'text-text-muted'
                        }
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Logs */}
                {logs && (
                  <div className="mt-4 p-3 rounded-lg bg-bg-tertiary text-left">
                    <p className="text-xs text-text-muted font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {logs.slice(-500)}
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted">
                  <AlertCircle className="w-4 h-4" />
                  <span>Do not close this page</span>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
