from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.dependencies.devices import get_device_repository
from app.repositories.device_image_repository import DeviceImageRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.inspection_repository import InspectionRepository
from app.services.gemini_service import GeminiService
from app.services.inspection_service import InspectionService


def get_inspection_repository(
    session: AsyncSession = Depends(get_session),
) -> InspectionRepository:
    return InspectionRepository(session)


def get_inspection_device_image_repository(
    session: AsyncSession = Depends(get_session),
) -> DeviceImageRepository:
    return DeviceImageRepository(session)


def get_gemini_service() -> GeminiService:
    return GeminiService()


def get_inspection_service(
    device_repository: DeviceRepository = Depends(get_device_repository),
    device_image_repository: DeviceImageRepository = Depends(
        get_inspection_device_image_repository
    ),
    inspection_repository: InspectionRepository = Depends(get_inspection_repository),
    gemini_service: GeminiService = Depends(get_gemini_service),
) -> InspectionService:
    return InspectionService(
        device_repository=device_repository,
        device_image_repository=device_image_repository,
        inspection_repository=inspection_repository,
        gemini_service=gemini_service,
    )
