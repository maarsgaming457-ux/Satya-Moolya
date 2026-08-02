import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order


class OrderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, order: Order) -> Order:
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)
        return order

    async def get_by_id(self, order_id: uuid.UUID) -> Order | None:
        result = await self.session.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()

    async def list_by_buyer(self, buyer_id: uuid.UUID) -> Sequence[Order]:
        result = await self.session.execute(
            select(Order)
            .where(Order.buyer_id == buyer_id)
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()

    async def list_by_seller(self, seller_id: uuid.UUID) -> Sequence[Order]:
        result = await self.session.execute(
            select(Order)
            .where(Order.seller_id == seller_id)
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()
