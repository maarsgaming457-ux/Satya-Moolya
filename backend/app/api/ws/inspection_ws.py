import asyncio
import uuid
import time
import logging
import json
import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.detection_service import DetectionService
from app.services.tracking_service import TrackingService
from app.services.quality_validation_service import QualityValidationService
from app.services.frame_selection_service import FrameSelectionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws/inspection", tags=["Live Inspection WebSocket"])

_detection_service = None
_tracking_service = None
_quality_service = None
_frame_selection_service = None


def get_ws_services():
    global _detection_service, _tracking_service, _quality_service, _frame_selection_service
    if _detection_service is None:
        _detection_service = DetectionService()
    if _tracking_service is None:
        _tracking_service = TrackingService()
    if _quality_service is None:
        _quality_service = QualityValidationService()
    if _frame_selection_service is None:
        _frame_selection_service = FrameSelectionService()
    return _detection_service, _tracking_service, _quality_service, _frame_selection_service

@router.websocket("/{device_id}")
async def inspection_websocket_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connected for device: {device_id}")
    detection_service, tracking_service, quality_service, frame_selection_service = get_ws_services()
    
    frame_count = 0
    start_time = time.time()
    last_frame_time = 0.0
    
    # 2MB Payload Limit
    MAX_PAYLOAD_SIZE = 2 * 1024 * 1024 
    # 10 FPS Rate Limit (100ms per frame)
    MIN_FRAME_INTERVAL = 0.100
    
    # State tracking
    current_view = "Front"
    
    try:
        while True:
            # Receive any message (bytes for frame, text for commands)
            message = await websocket.receive()
            
            if "text" in message:
                try:
                    payload = json.loads(message["text"])
                    if payload.get("type") == "set_view":
                        current_view = payload.get("view", current_view)
                        logger.info(f"[{device_id}] Switched target view to: {current_view}")
                except Exception as e:
                    logger.error(f"Error parsing text message: {e}")
                continue
                
            if "bytes" not in message:
                continue
                
            data = message["bytes"]
            
            # 1. Payload Size Validation
            if len(data) > MAX_PAYLOAD_SIZE:
                logger.warning(f"[{device_id}] Dropped frame: Payload too large ({len(data)} bytes)")
                await websocket.send_json({"status": "error", "error": "Payload too large", "frame_id": frame_count + 1})
                continue
                
            # 2. Rate Limiting (Token Bucket / FPS Limiter)
            current_time = time.time()
            if current_time - last_frame_time < MIN_FRAME_INTERVAL:
                # Silently drop frame to enforce rate limit without spamming errors
                continue
            last_frame_time = current_time
            
            # 3. Magic Bytes Validation (JPEG or PNG)
            # JPEG starts with FF D8 FF
            # PNG starts with 89 50 4E 47
            if not (data.startswith(b'\xff\xd8\xff') or data.startswith(b'\x89PNG')):
                logger.warning(f"[{device_id}] Dropped frame: Invalid image format/magic bytes")
                await websocket.send_json({"status": "error", "error": "Invalid image format", "frame_id": frame_count + 1})
                continue
            
            frame_count += 1
            
            try:
                # Decode frame with OpenCV (Offloaded to thread pool to prevent blocking)
                nparr = np.frombuffer(data, np.uint8)
                frame = await asyncio.to_thread(cv2.imdecode, nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    logger.warning(f"Failed to decode frame {frame_count} for device {device_id}")
                    await websocket.send_json({
                        "status": "error",
                        "error": "Failed to decode frame",
                        "frame_id": frame_count
                    })
                    continue
                
                # Calculate metrics
                height, width, _ = frame.shape
                elapsed = current_time - start_time
                fps = frame_count / elapsed if elapsed > 0 else 0.0
                
                # Run Phone Detection (Offloaded)
                raw_results = await asyncio.to_thread(detection_service.detect_raw, frame)
                
                # Run ByteTrack Tracking (Offloaded)
                tracks = await asyncio.to_thread(tracking_service.update, raw_results)
                
                # Run Image Quality Validation (Offloaded)
                validation = await asyncio.to_thread(quality_service.validate, frame, tracks)
                
                # Run Frame Selection (Offloaded)
                selection = await asyncio.to_thread(
                    frame_selection_service.process_frame,
                    device_id,
                    frame,
                    tracks,
                    validation,
                    current_view,
                    frame_count
                )
                
                # Log frame details periodically or when selected
                if selection.get("selected", False) or frame_count % 30 == 0:
                    logger.info(
                        f"[{device_id}] Frame {frame_count} | "
                        f"FPS {fps:.1f} | Tracks {len(tracks)} | "
                        f"Val: {validation['accepted']} | Sel: {selection.get('selected')} ({selection.get('reason')})"
                    )
                
                # Send acknowledgement with tracks, validation, and selection status
                await websocket.send_json({
                    "status": "received",
                    "frame_id": frame_count,
                    "fps": round(fps, 1),
                    "tracks": tracks,
                    "validation": validation,
                    "selection": selection
                })
                
            except Exception as decode_error:
                logger.error(f"Error processing frame {frame_count}: {decode_error}")
                await websocket.send_json({
                    "status": "error",
                    "error": "Internal processing error",
                    "frame_id": frame_count
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for device {device_id}")
    except Exception as e:
        logger.error(f"WebSocket connection error for device {device_id}: {e}")
        try:
            await websocket.close()
        except:
            pass
    finally:
        logger.info(f"Cleaned up WebSocket resources for device {device_id}")
