from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.dependencies.devices import get_device_repository
from app.repositories.device_image_repository import DeviceImageRepository
from app.repositories.device_repository import DeviceRepository
from app.services.device_image_service import DeviceImageService
from app.services.storage_service import SupabaseStorageService


def get_device_image_repository(
    session: AsyncSession = Depends(get_session),
) -> DeviceImageRepository:
    return DeviceImageRepository(session)


def get_storage_service() -> SupabaseStorageService:
    return SupabaseStorageService()


def get_device_image_service(
    device_repository: DeviceRepository = Depends(get_device_repository),
    device_image_repository: DeviceImageRepository = Depends(
        get_device_image_repository
    ),
    storage_service: SupabaseStorageService = Depends(get_storage_service),
) -> DeviceImageService:
    return DeviceImageService(
        device_repository=device_repository,
        device_image_repository=device_image_repository,
        storage_service=storage_service,
    )
