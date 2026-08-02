"use client"
import React, { useEffect, useRef } from "react"
import { Camera, SwitchCamera, VideoOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCamera } from "@/hooks/useCamera"
import { useInspectionWebSocket } from "@/hooks/websocket/useInspectionWebSocket"
import { useFrameStream } from "@/hooks/camera/useFrameStream"
import { DetectionOverlay } from "@/components/detection/DetectionOverlay"
import { CaptureProgress } from "@/components/inspection/CaptureProgress"
import { cn } from "@/lib/utils"

interface LiveCameraProps {
  onCapture?: (imageBlob: Blob) => void
  isActive?: boolean
  className?: string
  deviceId?: string // Needed for websocket connection
}

export function LiveCamera({ onCapture, isActive = true, className, deviceId = "test-device-id" }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null!)
  
  // 1. Manage WebSocket Connection
  const { status: wsStatus, sendFrame, setTargetView, lastAck } = useInspectionWebSocket(deviceId)

  // 2. Manage Camera stream
  const {
    stream,
    error,
    isInitializing,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera('environment')

  // 3. Extract frames from video and send to WebSocket
  useFrameStream({
    videoRef,
    onFrame: (blob) => {
      sendFrame(blob)
    },
    fps: 10,
    quality: 0.6,
    isActive: !!stream && wsStatus === 'Connected' // Only capture if camera is on and WS is connected
  })

  // Auto-start camera if active
  useEffect(() => {
    if (isActive && !stream && !error && !isInitializing) {
      startCamera()
    } else if (!isActive && stream) {
      stopCamera()
    }
  }, [isActive, stream, error, isInitializing, startCamera, stopCamera])

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error("Error playing video:", e))
    }
  }, [stream])
  
  // Strict cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className={cn("relative w-full h-full bg-black rounded-3xl overflow-hidden flex flex-col items-center justify-center", className)}>
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Camera Error</h3>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button onClick={() => startCamera()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isInitializing && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/80 font-medium">Initializing camera...</p>
        </div>
      )}

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          stream ? "opacity-100" : "opacity-0",
          facingMode === 'user' ? "scale-x-[-1]" : "" // Mirror front camera
        )}
      />

      {/* Placeholder when no stream and no error/loading */}
      {!stream && !isInitializing && !error && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center">
          <VideoOff className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-white/50">Camera is off</p>
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6 z-30">
        {!stream ? (
          <Button 
            size="lg"
            variant="secondary"
            className="rounded-full shadow-lg font-semibold"
            onClick={() => startCamera()}
            disabled={isInitializing}
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button 
              size="lg"
              variant="destructive"
              className="rounded-full shadow-lg font-semibold"
              onClick={stopCamera}
            >
              <VideoOff className="w-5 h-5 mr-2" />
              Stop Camera
            </Button>
            
            <Button 
              size="icon"
              variant="secondary"
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={switchCamera}
              title="Switch Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Detection Overlay */}
      <DetectionOverlay lastAck={lastAck} />

      {/* Capture Progress */}
      {stream && wsStatus === 'Connected' && (
        <CaptureProgress 
          lastAck={lastAck} 
          setTargetView={setTargetView} 
          onComplete={() => console.log("All views captured!")} 
        />
      )}

      {/* Status Indicators */}
      {stream && (
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              wsStatus === 'Connected' ? "bg-green-500" : 
              wsStatus === 'Connecting' || wsStatus === 'Reconnecting' ? "bg-yellow-500 animate-pulse" : 
              "bg-gray-500"
            )} />
            <span className="text-xs font-semibold text-white tracking-wider">
              {wsStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
