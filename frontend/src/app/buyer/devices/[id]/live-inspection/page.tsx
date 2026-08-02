"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveInspection } from "@/hooks/useLiveInspection";
import { Camera, CheckCircle2, Circle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

let _tempCanvas: HTMLCanvasElement | null = null;
function getTempCanvas() {
  if (typeof document === 'undefined') return null as any; // Server-side dummy
  if (!_tempCanvas) _tempCanvas = document.createElement("canvas");
  return _tempCanvas;
}

export default function LiveInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, result, connect, disconnect, sendFrame } = useLiveInspection(deviceId);
  
  const [fps, setFps] = useState(0);
  const lastFrameTime = useRef(Date.now());
  const requestRef = useRef<number | null>(null);

  // Initialize Camera
  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        if (!active) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.defaultMuted = true;
          videoRef.current.playsInline = true;
          try {
            await videoRef.current.play();
            console.log("PLAY SUCCESS");
          } catch (e) {
            console.error("PLAY FAILED - Exception:", e);
          }
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startCamera();
    connect();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [connect, disconnect]);

  // Frame Capture Loop
  const captureAndSendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || status !== 'connected') {
      requestRef.current = requestAnimationFrame(captureAndSendFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState === 4) { // HAVE_ENOUGH_DATA
      // Use a persistent canvas to prevent GPU context exhaustion
      const tempCanvas = getTempCanvas();
      
      if (tempCanvas.width !== video.videoWidth) tempCanvas.width = video.videoWidth;
      if (tempCanvas.height !== video.videoHeight) tempCanvas.height = video.videoHeight;
      
      const ctx = tempCanvas.getContext("2d");
      
      if (ctx) {
        // --- ADDED FOR RACE CONDITION PROOF ---
        if (!(window as any).frameLogs) {
            (window as any).frameLogs = [];
            (window as any).frameCount = 0;
            (window as any).completedFrames = 0;
        }
        const currentFrameId = (window as any).frameCount++;
        if (currentFrameId < 100) {
            (window as any).frameLogs.push({ event: 'drawImage', frameId: currentFrameId, time: performance.now() });
        }
        // --------------------------------------

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Save ONE snapshot for debugging
        if (!(window as any).hasSavedSnapshot) {
          (window as any).hasSavedSnapshot = true;
          const dataUrl = tempCanvas.toDataURL("image/jpeg", 1.0);
          console.log("SNAPSHOT SAVED (base64):", dataUrl.substring(0, 100) + "...");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "snapshot_debug.jpg";
          a.click();
        }
        
        // Compress and send
        if (currentFrameId < 100) {
            (window as any).frameLogs.push({ event: 'toBlob_start', frameId: currentFrameId, time: performance.now() });
        }
        tempCanvas.toBlob(async (blob: Blob | null) => {
          if (currentFrameId < 100) {
              (window as any).frameLogs.push({ event: 'toBlob_callback', frameId: currentFrameId, time: performance.now(), size: blob?.size });
              if (blob) {
                  const buffer = await blob.arrayBuffer();
                  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                  const hashArray = Array.from(new Uint8Array(hashBuffer));
                  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                  (window as any).frameLogs.push({ event: 'hash_computed', frameId: currentFrameId, hash: hashHex });
              }
          }
          if (blob) {
            sendFrame(blob);
            if (currentFrameId < 100) {
                (window as any).frameLogs.push({ event: 'ws_send', frameId: currentFrameId, time: performance.now() });
                (window as any).completedFrames++;
                if ((window as any).completedFrames === 100) {
                    console.log("RACE_LOG_COMPLETE", JSON.stringify((window as any).frameLogs));
                }
            }
            
            // Calculate FPS
            const now = Date.now();
            setFps(Math.round(1000 / (now - lastFrameTime.current)));
            lastFrameTime.current = now;
          }
        }, "image/jpeg", 0.7);
      }
    }
    
    // Throttle to ~15-20 FPS for stability if needed, but requestAnimationFrame goes up to 60.
    // We rely on the backend being able to process fast enough or dropping frames.
    setTimeout(() => {
      requestRef.current = requestAnimationFrame(captureAndSendFrame);
    }, 50); // roughly 20 FPS max limit
    
  }, [status, sendFrame]);

  useEffect(() => {
    if (status === 'connected') {
      requestRef.current = requestAnimationFrame(captureAndSendFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, captureAndSendFrame]);

  // Render Bounding Boxes
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !result) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (result.detections) {
      result.detections.forEach(det => {
        const [x1, y1, x2, y2] = det.bounding_box;
        const color = det.color || "#00FF00";
        
        // Draw Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
        // Draw Label
        ctx.fillStyle = color;
        ctx.font = "16px sans-serif";
        const label = `${det.class.toUpperCase()} ${Math.round(det.confidence * 100)}%`;
        ctx.fillText(label, x1, y1 > 20 ? y1 - 5 : y1 + 20);
        
        if (det.track_id) {
          ctx.fillText(`ID: ${det.track_id}`, x1 + 150, y1 > 20 ? y1 - 5 : y1 + 20);
        }
      });
    }
  }, [result]);

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: Video Feed */}
        <div className="flex-1">
          <Card className="overflow-hidden bg-black/90 border-slate-800 relative">
            <div className="relative aspect-[4/3] w-full bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-contain"
              />
              <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              
              {/* Overlay HUD */}
              <div className="absolute top-4 left-4 right-4 flex justify-between text-white drop-shadow-md">
                <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full text-sm">
                  {fps} FPS
                </div>
              </div>
              
              {/* Central Instruction */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <div className="bg-blue-600/90 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-xl flex items-center space-x-3">
                  {status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Capture Complete!</span>
                    </>
                  ) : (
                    <span>{result?.instruction || "Connecting to AI..."}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right: Progress Panel */}
        <div className="w-full md:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inspection Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result?.progress ? (
                <div className="space-y-3">
                  {result.progress.map((p) => (
                    <div key={p.angle} className="flex items-center space-x-3 text-sm">
                      {p.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className={p.completed ? "font-medium text-slate-900 dark:text-slate-100" : "text-slate-500"}>
                        {p.angle} View
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Waiting for pipeline...</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={status === 'connected' ? 'text-green-600 font-medium' : 'text-amber-600'}>
                    {status.toUpperCase()}
                  </span>
                </div>
                {result?.quality && (
                  <>
                    <div className="flex justify-between">
                      <span>Blur Score:</span>
                      <span>{Math.round(result.quality.blur_score)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brightness:</span>
                      <span>{Math.round(result.quality.brightness)}</span>
                    </div>
                  </>
                )}
                {result?.detected_angle && (
                  <div className="flex justify-between">
                    <span>Detected Angle:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {result.detected_angle}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {status === 'completed' && (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => router.push(`/buyer/devices/${deviceId}`)}
            >
              View Final Report
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
}
