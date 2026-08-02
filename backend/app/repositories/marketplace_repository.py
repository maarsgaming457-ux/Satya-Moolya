import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.marketplace import ListingStatus, MarketplaceListing


class MarketplaceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, listing: MarketplaceListing) -> MarketplaceListing:
        self.session.add(listing)
        await self.session.commit()
        await self.session.refresh(listing)
        return listing

    async def get_by_id(self, listing_id: uuid.UUID) -> MarketplaceListing | None:
        result = await self.session.execute(
            select(MarketplaceListing).where(MarketplaceListing.id == listing_id)
        )
        return result.scalar_one_or_none()

    async def get_active_by_device(
        self, device_id: uuid.UUID
    ) -> MarketplaceListing | None:
        result = await self.session.execute(
            select(MarketplaceListing).where(
                MarketplaceListing.device_id == device_id,
                MarketplaceListing.status == ListingStatus.ACTIVE,
            )
        )
        return result.scalar_one_or_none()

    async def list_active(
        self, limit: int = 100, offset: int = 0
    ) -> Sequence[MarketplaceListing]:
        result = await self.session.execute(
            select(MarketplaceListing)
            .where(MarketplaceListing.status == ListingStatus.ACTIVE)
            .order_by(MarketplaceListing.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def delete(self, listing: MarketplaceListing) -> None:
        await self.session.delete(listing)
        await self.session.commit()
