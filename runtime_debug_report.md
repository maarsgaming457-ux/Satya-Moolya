# Runtime Debug Report

## First Runtime Failure

The first runtime failure is backend phone detection returning `False` before quality validation runs.

## Reproduction Path

- Browser page: `frontend/src/app/buyer/devices/[id]/live-inspection/page.tsx`
- Hook: `frontend/src/hooks/useLiveInspection.ts`
- WebSocket URL observed in browser console: `ws://127.0.0.1:8000/api/v1/live-inspection/runtime-debug-device`
- Backend route: `backend/app/api/v1/routers/live_inspection.py`
- Backend service: `backend/app/services/live_inspection_service.py`
- Vision module: `backend/app/services/vision_service.py`

## Browser Runtime Trace

1. `LiveInspectionPage`
   - File: `frontend/src/app/buyer/devices/[id]/live-inspection/page.tsx`
   - Function: `LiveInspectionPage`
   - Line: 17
   - Next function: `useLiveInspection(deviceId)`

2. `connect`
   - File: `frontend/src/hooks/useLiveInspection.ts`
   - Function: `connect`
   - Line: 33
   - Output: WebSocket connected to `/api/v1/live-inspection/runtime-debug-device`

3. `captureAndSendFrame`
   - File: `frontend/src/app/buyer/devices/[id]/live-inspection/page.tsx`
   - Function: `captureAndSendFrame`
   - Line: 76
   - Runtime events observed:
     - `drawImage`
     - `toBlob_start`
     - `toBlob_callback`
     - `hash_computed`
     - `ws_send`
   - First observed browser blob size: `6032` bytes

4. `sendFrame`
   - File: `frontend/src/hooks/useLiveInspection.ts`
   - Function: `sendFrame`
   - Line: 100
   - Output: binary JPEG blob sent while WebSocket state was `OPEN`

5. `live_inspection_ws`
   - File: `backend/app/api/v1/routers/live_inspection.py`
   - Function: `live_inspection_ws`
   - Line: 104
   - Next function: `live_service.process_frame(session, frame_to_process)`

6. `process_frame`
   - File: `backend/app/services/live_inspection_service.py`
   - Function: `process_frame`
   - Line: 51
   - Next function: `vision_service.detect_phone(frame)`

7. `detect_phone`
   - File: `backend/app/services/vision_service.py`
   - Function: `detect_phone`
   - Line: 107
   - Return value: `(False, [])`

## Exact Stop Point

- First failing file: `backend/app/services/live_inspection_service.py`
- First failing function: `process_frame`
- Exact line: 69
- Condition:
  ```python
  if not phone_detected:
  ```
- Runtime values:
  - `phone_detected = False`
  - `phone_bbox = []`
  - `session.current_angle_idx = 0`
  - `session.get_current_angle() = "Front"`
  - `session.completed_angles = []`
  - `quality = not assigned`
  - `detected_angle = not assigned in this frame before return`
- Actual WebSocket response:
  ```json
  {
    "instruction": "Show the Front of the device.",
    "completed": false,
    "progress": [
      {"angle": "Front", "completed": false},
      {"angle": "Back", "completed": false},
      {"angle": "Left", "completed": false},
      {"angle": "Right", "completed": false},
      {"angle": "Top", "completed": false},
      {"angle": "Bottom", "completed": false}
    ],
    "detections": [],
    "quality": null,
    "detected_angle": "Unknown"
  }
  ```

## Detector Runtime Values

- File: `backend/app/services/vision_service.py`
- Function: `VisionService.__init__`
- Runtime values:
  - `custom_weights_path = "models/device_damage.pt"`
  - `yolo_model = None`
  - `florence_model = None`
  - `florence_processor = None`
  - `phone_model = YOLO`, but it is not used by `detect_phone`
  - `comp_detector = None`
- Model load failure observed:
  - `GroundingDinoComponentDetector` failed to load from Hugging Face.
  - `Grounding DINO` failed to load from Hugging Face.
  - Error included: `[WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions`

## Why The Next Stage Never Executes

`process_frame()` returns immediately at line 70 after `phone_detected` is false. Therefore these stages never execute:

- tracking
- quality validation
- component detection
- orientation inference
- damage detection
- capture selection
- state machine increment
- finalization
- database persistence
- Gemini
- pricing
- PDF/JSON report generation
- Supabase upload

## One Primary Root Cause

The primary root cause is that `VisionService.detect_phone()` depends only on `self.florence_model` and `self.florence_processor`, but both are `None` at runtime because Grounding DINO failed to load. As a result, every frame is treated as having no phone, so the live inspection state machine remains permanently on the Front view.
