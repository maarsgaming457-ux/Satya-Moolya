from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import uuid
import numpy as np
import cv2
import logging
from app.services.vision_service import VisionService
from app.services.live_inspection_service import LiveInspectionService

from app.core.database import get_sessionmaker
from app.repositories.device_repository import DeviceRepository
from app.services.storage_service import SupabaseStorageService
from app.models.inspection import Inspection
from app.repositories.inspection_repository import InspectionRepository
from app.services.gemini_service import GeminiService
from app.services.inspection_service import _run_ai_inspection_task

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live-inspection", tags=["Live Inspection"])

# Instantiate singletons for the app lifecycle
vision_service = VisionService()
live_service = LiveInspectionService(vision_service)

import asyncio
import time

async def finalize_live_inspection(device_id_str: str, captured_frames: dict):
    try:
        device_id = uuid.UUID(device_id_str)
        async_session_factory = get_sessionmaker()
        
        async with async_session_factory() as db_session:
            device_repo = DeviceRepository(db_session)
            device = await device_repo.get_by_id(device_id)
            if not device:
                logger.error(f"Device {device_id_str} not found during finalization.")
                return False, f"Device {device_id_str} not found"
            
            owner_id = device.owner_id
            
            storage_service = SupabaseStorageService()
            accepted_images = []
            
            for angle, data in captured_frames.items():
                img = data.get("image")
                if img is None:
                    continue
                quality = data.get("quality", {})
                
                success, buffer = cv2.imencode(".jpg", img)
                if not success:
                    continue
                
                url = await storage_service.upload_file(
                    file_data=buffer.tobytes(),
                    filename=f"{device_id}_{angle}.jpg",
                    content_type="image/jpeg",
                    folder=f"{owner_id}/inspections"
                )
                
                accepted_images.append({
                    "image_id": str(uuid.uuid4()),
                    "image_data": img,
                    "url": url,
                    "blur_score": quality.get("blur_score", 0),
                    "brightness": quality.get("brightness", 0),
                    "quality_score": data.get("score", 0),
                    "angle": angle,
                    "accepted": True
                })
            
            inspection_repo = InspectionRepository(db_session)
            inspection = Inspection(
                device_id=device.id,
                inspection_score=0,
                trust_score=0,
                estimated_price=0,
                condition="Pending AI Analysis",
                summary="Inspection is running in the background. Please check back shortly.",
                detected_issues=[],
                confidence=0.0
            )
            created_inspection = await inspection_repo.create(inspection)
            inspection_id = created_inspection.id
            
        gemini_service = GeminiService()
        await _run_ai_inspection_task(
            inspection_id=inspection_id,
            device_id=device.id,
            accepted_images=accepted_images,
            gemini_service=gemini_service,
            functional_tests=None,
            seller_claims=None
        )
        logger.info(f"Live inspection finalized for {device_id_str}.")
        return True, None
        
    except Exception as e:
        logger.error(f"Failed to finalize live inspection for {device_id_str}: {e}")
        return False, str(e)

@router.websocket("/{device_id}")
async def live_inspection_ws(websocket: WebSocket, device_id: str):
    logger.info("ENTRY")
    try:
        print("=== BACKEND WS DEBUG ===")
        print("Attempting to accept websocket for device_id:", device_id)
        await websocket.accept()
        print("Websocket accepted!")
        session = live_service.get_or_create_session(device_id)
        
        # Producer-Consumer Single-Frame Buffer state
        latest_frame = None
        new_frame_event = asyncio.Event()
    except Exception as e:
        logger.exception("Pre-handshake exception:")
        raise
    keep_running = True
    
    # Metrics
    metrics = {
        "overwrite_count": 0,
        "frames_dropped": 0,
        "frames_processed": 0,
        "latest_frame_id": 0,
        "current_frame_id": 0,
        "worker_idle_time": 0.0,
        "worker_busy_time": 0.0
    }
    
    async def ai_worker():
        nonlocal latest_frame, keep_running
        while keep_running:
            idle_start = time.time()
            await new_frame_event.wait()
            metrics["worker_idle_time"] += time.time() - idle_start
            
            new_frame_event.clear()
            
            if not keep_running or latest_frame is None:
                break
                
            # Safely extract the latest frame from the buffer
            frame_to_process, frame_id, t_decode_ms = latest_frame
            metrics["current_frame_id"] = frame_id
            
            busy_start = time.time()
            
            try:
                # process_frame executes heavy AI inference synchronously via to_thread
                t0_inf = time.time()
                result = await live_service.process_frame(session, frame_to_process)
                t_inference_ms = (time.time() - t0_inf) * 1000
                
                # Send the final JSON payload
                t0_send = time.time()
                await websocket.send_json(result)
                t_send_ms = (time.time() - t0_send) * 1000
                
                metrics["worker_busy_time"] += time.time() - busy_start
                metrics["frames_processed"] += 1
                
                print(f"[Worker] ID={frame_id} | Inference: {t_inference_ms:.1f}ms | Send: {t_send_ms:.1f}ms")
                print(f"[Metrics] Processed: {metrics['frames_processed']} | Dropped: {metrics['frames_dropped']} | Overwrites: {metrics['overwrite_count']} | Idle: {metrics['worker_idle_time']:.2f}s | Busy: {metrics['worker_busy_time']:.2f}s")
                
                if result.get("completed"):
                    await websocket.send_json({"status": "Finalizing report..."})
                    logger.info("CLOSING FROM BACKEND - Completed")
                    
                    # We do not close the websocket here so we can wait for finalization
                    # Actually, the prompt says "ONLY AFTER ALL OF THE ABOVE SUCCEEDS call remove_session(device_id)"
                    # We can await finalization here so the session isn't removed until it succeeds.
                    captured_data = dict(session.captured_frames)
                    success, err = await finalize_live_inspection(device_id, captured_data)
                    
                    if success:
                        await websocket.send_json({"status": "Final report processed."})
                        live_service.remove_session(device_id)
                    else:
                        await websocket.send_json({"error": f"Inspection failed: {err}"})
                        # Do NOT remove session so we keep frames
                    
                    keep_running = False
                    await websocket.close()
                    break
            except Exception as e:
                logger.error(f"[Worker] Error during AI inference: {e}")
                if keep_running:
                    # Let the next frame trigger processing
                    continue
    
    # Spawn the background AI worker task
    worker_task = asyncio.create_task(ai_worker())
    frame_counter = 0
    
    try:
        while keep_running:
            t0_rx = time.time()
            # Receive loop never blocks on AI inference
            data = await websocket.receive_bytes()
            t_receive_ms = (time.time() - t0_rx) * 1000
            
            t0_dec = time.time()
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            t_decode_ms = (time.time() - t0_dec) * 1000
            
            if frame is None:
                await websocket.send_json({"error": "Failed to decode frame"})
                continue
                
            frame_counter += 1
            metrics["latest_frame_id"] = frame_counter
            
            # If the event is already set, the worker hasn't consumed the PREVIOUS frame yet
            if new_frame_event.is_set():
                metrics["overwrite_count"] += 1
                metrics["frames_dropped"] += 1
            
            # Replace the buffer with the absolute latest frame
            latest_frame = (frame, frame_counter, t_decode_ms)
            # Signal the worker
            new_frame_event.set()
            
            if frame_counter % 30 == 0:
                print(f"[Receiver] Latest ID={frame_counter} | Rx={t_receive_ms:.1f}ms | Decode={t_decode_ms:.1f}ms")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for device {device_id}")
    except Exception as e:
        logger.error(f"Live inspection error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
    finally:
        keep_running = False
        new_frame_event.set() # Wake up worker to allow it to exit cleanly
        # Session is removed ONLY on success during finalization
