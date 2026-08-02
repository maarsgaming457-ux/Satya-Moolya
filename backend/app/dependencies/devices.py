from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.repositories.device_repository import DeviceRepository
from app.services.device_service import DeviceService


def get_device_repository(
    session: AsyncSession = Depends(get_session),
) -> DeviceRepository:
    return DeviceRepository(session)


def get_device_service(
    device_repository: DeviceRepository = Depends(get_device_repository),
) -> DeviceService:
    return DeviceService(device_repository)
