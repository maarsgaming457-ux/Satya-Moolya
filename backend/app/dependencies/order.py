from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.dependencies.marketplace import get_marketplace_repository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.repositories.order_repository import OrderRepository
from app.services.order_service import OrderService


def get_order_repository(
    session: AsyncSession = Depends(get_session),
) -> OrderRepository:
    return OrderRepository(session)


def get_order_service(
    order_repository: OrderRepository = Depends(get_order_repository),
    marketplace_repository: MarketplaceRepository = Depends(get_marketplace_repository),
) -> OrderService:
    return OrderService(
        order_repository=order_repository,
        marketplace_repository=marketplace_repository,
    )
