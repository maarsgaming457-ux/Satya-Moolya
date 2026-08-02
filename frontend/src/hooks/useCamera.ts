import { useState, useEffect, useRef, useCallback } from 'react'

export type FacingMode = 'user' | 'environment'

interface UseCameraReturn {
  stream: MediaStream | null
  error: string | null
  isInitializing: boolean
  facingMode: FacingMode
  startCamera: () => Promise<void>
  stopCamera: () => void
  switchCamera: () => Promise<void>
}

export function useCamera(initialFacingMode: FacingMode = 'environment'): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const startCamera = useCallback(async (mode: FacingMode = facingMode) => {
    setIsInitializing(true)
    setError(null)
    
    // Stop any existing stream before starting a new one
    stopCamera()

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false // We only need video for inspection
      })

      streamRef.current = mediaStream
      setStream(mediaStream)
      setFacingMode(mode)
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please grant permission in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found.')
      } else {
        setError(err.message || 'An unknown error occurred while accessing the camera.')
      }
    } finally {
      setIsInitializing(false)
    }
  }, [facingMode, stopCamera])

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    await startCamera(newMode)
  }, [facingMode, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    stream,
    error,
    isInitializing,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera
  }
}
