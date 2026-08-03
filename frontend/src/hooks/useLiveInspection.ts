import { useState, useEffect, useRef, useCallback } from 'react';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL not defined");
  return url;
};

interface BoundingBox {
    class: string;
    confidence: number;
    bounding_box: [number, number, number, number];
    severity: string;
    color: string;
    track_id: number | null;
}

interface InspectionProgress {
    angle: string;
    completed: boolean;
}

interface LiveInspectionResult {
    instruction: string;
    completed: boolean;
    progress: InspectionProgress[];
    detections: BoundingBox[];
    quality?: any;
    detected_angle?: string;
    error?: string;
}

export const useLiveInspection = (deviceId: string) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'completed' | 'error'>('idle');
    const [result, setResult] = useState<LiveInspectionResult | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }
        
        setStatus('connecting');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiUrl = getApiUrl();
        const wsUrl = `${apiUrl.replace('http', 'ws')}/live-inspection/${deviceId}`;
        
        console.log("=== WEBSOCKET DEBUG ===");
        console.log("1. Exact WebSocket URL:", wsUrl);
        console.log("2. Exact deviceId:", deviceId);
        console.log("3. Is deviceId test-device-id?", deviceId === 'test-device-id');
        console.log("=======================");
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected. URL:", wsUrl, "readyState:", ws.readyState);
            setStatus('connected');
        };

        ws.onmessage = (event) => {
            try {
                // console.log("Incoming JSON:", event.data);
                const data: LiveInspectionResult = JSON.parse(event.data);
                if (data.error) {
                    console.error("Live inspection error:", data.error);
                } else {
                    setResult(data);
                    if (data.completed) {
                        setStatus('completed');
                    }
                }
            } catch (err) {
                console.error("FULL ERROR processing onmessage:", err);
            }
        };

        ws.onerror = (error) => {
            // In React Strict Mode, a disconnect during CONNECTING will fire onerror.
            // We can't easily suppress all errors, but we can log context.
            console.error("WebSocket Error:", error, "readyState:", ws.readyState);
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed");
            console.log("event.code:", event.code);
            console.log("event.reason:", event.reason);
            console.log("event.wasClean:", event.wasClean);
            console.log("readyState:", ws.readyState);
            setStatus(prev => prev !== 'completed' ? 'idle' : prev);
        };

        wsRef.current = ws;
    }, [deviceId]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            console.log("CLOSING FROM FRONTEND");
            console.log("File: useLiveInspection.ts");
            console.log("Line: disconnect callback");
            console.log("Reason: Component unmounted or explicitly disconnected");
            try { throw new Error("Call stack trace"); } catch(e) { console.log((e as Error).stack); }
            wsRef.current.close();
            wsRef.current = null;
        }
        setStatus('idle');
    }, []);

    const sendFrame = useCallback((frameBlob: Blob) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(frameBlob);
        }
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        status,
        result,
        connect,
        disconnect,
        sendFrame
    };
};
