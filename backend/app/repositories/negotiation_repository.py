import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.negotiation import Negotiation


class NegotiationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, negotiation: Negotiation) -> Negotiation:
        self.session.add(negotiation)
        await self.session.commit()
        await self.session.refresh(negotiation)
        return negotiation

    async def get_by_id(self, negotiation_id: uuid.UUID) -> Negotiation | None:
        result = await self.session.execute(
            select(Negotiation).where(Negotiation.id == negotiation_id)
        )
        return result.scalar_one_or_none()

    async def list_by_listing(
        self, listing_id: uuid.UUID, limit: int = 100, offset: int = 0
    ) -> Sequence[Negotiation]:
        result = await self.session.execute(
            select(Negotiation)
            .where(Negotiation.listing_id == listing_id)
            .order_by(Negotiation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def list_user_negotiations(
        self, user_id: uuid.UUID, status: str | None = None, limit: int = 100, offset: int = 0
    ) -> Sequence[Negotiation]:
        from app.models.marketplace import MarketplaceListing
        # Note: Negotiation model does not have a status field, so we ignore it.
        result = await self.session.execute(
            select(Negotiation)
            .join(MarketplaceListing, Negotiation.listing_id == MarketplaceListing.id)
            .where(
                (Negotiation.buyer_id == user_id) | (MarketplaceListing.seller_id == user_id)
            )
            .order_by(Negotiation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
