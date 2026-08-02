import { useEffect, useRef, useCallback } from 'react'

interface UseFrameStreamProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onFrame: (blob: Blob) => void
  fps?: number
  quality?: number
  isActive?: boolean
}

export function useFrameStream({ 
  videoRef, 
  onFrame, 
  fps = 10, 
  quality = 0.6,
  isActive = true
}: UseFrameStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isComponentMounted = useRef(true)

  // Initialize canvas only once
  useEffect(() => {
    isComponentMounted.current = true
    canvasRef.current = document.createElement('canvas')
    
    return () => {
      isComponentMounted.current = false
      canvasRef.current = null
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const captureFrame = useCallback(() => {
    if (!isComponentMounted.current || !isActive || !videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current

    // Only capture if video has loaded and is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused) {
      // Match canvas dimensions to video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to highly compressed JPEG Blob
        canvas.toBlob(
          (blob) => {
            if (blob && isComponentMounted.current) {
              onFrame(blob)
            }
          },
          'image/jpeg',
          quality
        )
      }
    }
  }, [isActive, onFrame, quality, videoRef])

  useEffect(() => {
    if (isActive) {
      const msPerFrame = 1000 / fps
      intervalRef.current = setInterval(captureFrame, msPerFrame)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, fps, captureFrame])
}
