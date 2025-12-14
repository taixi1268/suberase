'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Region {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface RegionSelectorProps {
  videoUrl: string
  regions: Region[]
  onRegionsChange: (regions: Region[]) => void
  disabled?: boolean
}

export function RegionSelector({
  videoUrl,
  regions,
  onRegionsChange,
  disabled,
}: RegionSelectorProps) {
  const t = useTranslations('edit')
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Video control state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Video controls
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  // Get mouse position relative to canvas (in video coordinates)
  const getMousePos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    // 计算鼠标在 canvas 上的相对位置 (0-1)
    const relativeX = (e.clientX - rect.left) / rect.width
    const relativeY = (e.clientY - rect.top) / rect.height

    // 转换为视频坐标
    return {
      x: relativeX * video.videoWidth,
      y: relativeY * video.videoHeight,
    }
  }, [])

  // Draw regions on canvas
  const drawRegions = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !video) return

    // 设置 canvas 内部分辨率为视频分辨率
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing regions
    regions.forEach((region) => {
      const isSelected = region.id === selectedRegion

      // Fill
      ctx.fillStyle = isSelected
        ? 'rgba(139, 92, 246, 0.3)'
        : 'rgba(59, 130, 246, 0.2)'
      ctx.fillRect(region.x, region.y, region.width, region.height)

      // Border
      ctx.strokeStyle = isSelected ? '#8B5CF6' : '#3B82F6'
      ctx.lineWidth = 3
      ctx.setLineDash(isSelected ? [] : [8, 8])
      ctx.strokeRect(region.x, region.y, region.width, region.height)

      // Delete button (corner)
      if (isSelected) {
        const btnSize = 30
        const btnX = region.x + region.width - btnSize / 2
        const btnY = region.y - btnSize / 2

        ctx.fillStyle = '#EF4444'
        ctx.beginPath()
        ctx.arc(btnX, btnY, btnSize / 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'white'
        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('×', btnX, btnY)
      }
    })

    // Draw current drawing region
    if (currentRegion) {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
      ctx.fillRect(
        currentRegion.x,
        currentRegion.y,
        currentRegion.width,
        currentRegion.height
      )

      ctx.strokeStyle = '#8B5CF6'
      ctx.lineWidth = 3
      ctx.setLineDash([])
      ctx.strokeRect(
        currentRegion.x,
        currentRegion.y,
        currentRegion.width,
        currentRegion.height
      )
    }

    ctx.setLineDash([])
  }, [regions, currentRegion, selectedRegion])

  // Update canvas size when video loads or window resizes
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    const updateSize = () => {
      const containerWidth = container.clientWidth
      const videoAspect = video.videoWidth / video.videoHeight || 16 / 9
      const height = containerWidth / videoAspect

      setCanvasSize({ width: containerWidth, height })
      setDuration(video.duration || 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', updateSize)
    video.addEventListener('loadeddata', updateSize)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    window.addEventListener('resize', updateSize)

    // Initial update
    if (video.videoWidth > 0) {
      updateSize()
    }

    return () => {
      video.removeEventListener('loadedmetadata', updateSize)
      video.removeEventListener('loadeddata', updateSize)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      window.removeEventListener('resize', updateSize)
    }
  }, [videoUrl])

  // Redraw when regions change
  useEffect(() => {
    drawRegions()
  }, [drawRegions, canvasSize])

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()

    const pos = getMousePos(e)
    const video = videoRef.current
    if (!video) return

    // Check if clicking on delete button
    for (const region of regions) {
      if (region.id === selectedRegion) {
        const btnSize = 30
        const btnX = region.x + region.width - btnSize / 2
        const btnY = region.y - btnSize / 2
        const dist = Math.sqrt((pos.x - btnX) ** 2 + (pos.y - btnY) ** 2)

        if (dist <= btnSize / 2) {
          onRegionsChange(regions.filter((r) => r.id !== region.id))
          setSelectedRegion(null)
          return
        }
      }
    }

    // Check if clicking on existing region
    for (const region of regions) {
      if (
        pos.x >= region.x &&
        pos.x <= region.x + region.width &&
        pos.y >= region.y &&
        pos.y <= region.y + region.height
      ) {
        setSelectedRegion(region.id)
        return
      }
    }

    // Start drawing new region
    setSelectedRegion(null)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentRegion({
      id: `region-${Date.now()}`,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentRegion) return

    const pos = getMousePos(e)

    const newRegion = {
      ...currentRegion,
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    }

    setCurrentRegion(newRegion)
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRegion) return

    setIsDrawing(false)

    // Only add region if it has a minimum size
    if (currentRegion.width > 20 && currentRegion.height > 20) {
      onRegionsChange([...regions, currentRegion])
      setSelectedRegion(currentRegion.id)
    }

    setCurrentRegion(null)
  }

  return (
    <div ref={containerRef} className="w-full bg-black rounded-xl overflow-hidden">
      {/* Video container with canvas overlay */}
      <div className="relative">
        {/* Video (hidden controls) */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          playsInline
          crossOrigin="anonymous"
        />

        {/* Canvas Overlay for drawing regions */}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute top-0 left-0 w-full h-full',
            disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
          )}
          style={{
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Instructions overlay */}
        {regions.length === 0 && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl">
              <p className="text-base text-white">
                {t('step2')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Video Controls */}
      <div className="bg-bg-secondary/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Time display */}
        <span className="text-sm text-text-secondary min-w-[80px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary-blue
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-primary-purple
            [&::-webkit-slider-thumb]:transition-colors"
        />

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
