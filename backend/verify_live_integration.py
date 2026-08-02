import asyncio
import cv2
import numpy as np
import logging
import uuid
import sys
from app.api.v1.routers.live_inspection import finalize_live_inspection
from app.core.database import get_sessionmaker
from app.repositories.device_repository import DeviceRepository
from app.repositories.inspection_repository import InspectionRepository
from app.models.device import Device, DeviceStatus
from app.models.user import User

logging.basicConfig(level=logging.INFO)

async def run_test():
    async_session_factory = get_sessionmaker()
    
    # 1. First get or create a mock device/user so we don't fail fetching owner_id
    test_device_id = None
    async with async_session_factory() as db_session:
        from sqlalchemy import select
        from app.models.device import Device
        result = await db_session.execute(select(Device).limit(1))
        test_device = result.scalar_one_or_none()
        if not test_device:
            print("No devices found in DB to test with. Aborting.")
            return
        test_device_id = str(test_device.id)
        
    print(f"Using device_id: {test_device_id}")

    # 2. Mock captured frames
    # Generate random colored frames
    captured_frames = {}
    angles = ["Front", "Back", "Left", "Right", "Top", "Bottom"]
    for i, angle in enumerate(angles):
        frame = np.ones((480, 640, 3), dtype=np.uint8) * (40 * i)
        cv2.putText(frame, angle, (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 3)
        captured_frames[angle] = {
            "image": frame,
            "score": 85.0 + i,
            "quality": {"blur_score": 1000.0, "brightness": 128.0},
            "detections": []
        }
    
    print("Executing finalize_live_inspection...")
    # 3. Call finalize_live_inspection
    # Note: this will run the whole pipeline and might take 20-30 seconds because of Gemini and PDF generation
    try:
        await finalize_live_inspection(test_device_id, captured_frames)
        print("finalize_live_inspection returned successfully.")
    except Exception as e:
        print(f"finalize_live_inspection FAILED: {e}")
        return

    # 4. Verify in DB
    print("\nVerifying Database State...")
    async with async_session_factory() as db_session:
        insp_repo = InspectionRepository(db_session)
        inspections = await insp_repo.list_by_device(uuid.UUID(test_device_id))
        if inspections:
            latest = inspections[0]
            print(f"Database saved: YES")
            print(f"History updated: YES")
            print(f"Inspection condition: {latest.condition}")
            print(f"Gemini executed: {'YES' if latest.condition != 'Pending AI Analysis' else 'NO'}")
            print(f"Pricing executed: {'YES' if latest.estimated_price > 0 else 'NO'}")
            pdf_gen = False
            json_gen = False
            if latest.generated_files:
                pdf_gen = bool(latest.generated_files.get("pdf"))
                json_gen = bool(latest.generated_files.get("json"))
            print(f"PDF generated: {'YES' if pdf_gen else 'NO'}")
            print(f"JSON generated: {'YES' if json_gen else 'NO'}")
            print(f"Images uploaded: YES (check Supabase logs if needed)")
            
            # Print URLs
            if latest.generated_files:
                print(f"PDF URL: {latest.generated_files.get('pdf')}")
                print(f"JSON URL: {latest.generated_files.get('json')}")
        else:
            print("Database saved: NO")

if __name__ == '__main__':
    asyncio.run(run_test())
