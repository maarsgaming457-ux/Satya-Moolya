import { useState, useEffect, useRef, useCallback } from 'react'

export type ConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting'

export interface InspectionAckPayload {
  status: string;
  frame_id?: number;
  fps?: number;
  error?: string;
  tracks?: any[]; // Replace with specific Track interface if needed, keeping generic array for now
  validation?: any;
  selection?: any;
}

interface UseInspectionWebSocketReturn {
  status: ConnectionStatus
  sendFrame: (blob: Blob) => void
  setTargetView: (view: string) => void
  lastAck: InspectionAckPayload | null
}

export function useInspectionWebSocket(deviceId: string): UseInspectionWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('Disconnected')
  const [lastAck, setLastAck] = useState<InspectionAckPayload | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isComponentMounted = useRef(true)
  
  // Reconnect logic variables
  const reconnectAttempts = useRef(0)
  const maxReconnectDelay = 5000
  const baseReconnectDelay = 1000

  const connect = useCallback(() => {
    if (!isComponentMounted.current) return
    
    // Clear any existing connection/timeout
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }
    
    setStatus(reconnectAttempts.current > 0 ? 'Reconnecting' : 'Connecting')
    
    try {
      const wsBase = process.env.NEXT_PUBLIC_WS_URL
      
      if (!wsBase) {
        throw new Error('NEXT_PUBLIC_WS_URL environment variable is not defined.')
      }

      const wsUrl = `${wsBase}/ws/inspection/${deviceId}`
      const ws = new WebSocket(wsUrl)
      
      // We are sending Blobs, so binary type should be blob
      ws.binaryType = 'blob'
      
      ws.onopen = () => {
        if (!isComponentMounted.current) {
          ws.close()
          return
        }
        setStatus('Connected')
        reconnectAttempts.current = 0
        console.log(`[WebSocket] Connected to inspection WS for device ${deviceId}`)
      }
      
      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return
        try {
          const data = JSON.parse(event.data)
          setLastAck(data)
        } catch (e) {
          console.error('[WebSocket] Failed to parse message', event.data)
        }
      }
      
      ws.onclose = () => {
        if (!isComponentMounted.current) return
        setStatus('Disconnected')
        
        // Exponential backoff reconnect
        reconnectAttempts.current += 1
        const delay = Math.min(baseReconnectDelay * Math.pow(1.5, reconnectAttempts.current), maxReconnectDelay)
        
        console.log(`[WebSocket] Disconnected. Reconnecting in ${delay}ms...`)
        reconnectTimeoutRef.current = setTimeout(connect, delay)
      }
      
      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        // onclose will handle the reconnect
      }
      
      wsRef.current = ws
    } catch (e) {
      console.error('[WebSocket] Connection failed', e)
      setStatus('Disconnected')
    }
  }, [deviceId])

  // Initial connection & unmount cleanup
  useEffect(() => {
    isComponentMounted.current = true
    connect()
    
    return () => {
      isComponentMounted.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const sendFrame = useCallback((blob: Blob) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(blob)
    }
  }, [])

  const setTargetView = useCallback((view: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'set_view', view }))
    }
  }, [])

  return {
    status,
    sendFrame,
    setTargetView,
    lastAck
  }
}
