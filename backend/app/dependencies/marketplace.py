from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.dependencies.devices import get_device_repository
from app.dependencies.inspection import get_inspection_repository
from app.repositories.device_repository import DeviceRepository
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.services.marketplace_service import MarketplaceService


def get_marketplace_repository(
    session: AsyncSession = Depends(get_session),
) -> MarketplaceRepository:
    return MarketplaceRepository(session)


def get_marketplace_service(
    marketplace_repository: MarketplaceRepository = Depends(get_marketplace_repository),
    device_repository: DeviceRepository = Depends(get_device_repository),
    inspection_repository: InspectionRepository = Depends(get_inspection_repository),
) -> MarketplaceService:
    return MarketplaceService(
        marketplace_repository=marketplace_repository,
        device_repository=device_repository,
        inspection_repository=inspection_repository,
    )
