import uuid
from collections.abc import Sequence
from datetime import datetime

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inspection import Inspection


class InspectionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, inspection: Inspection) -> Inspection:
        """Standard create with its own transaction commit."""
        self.session.add(inspection)
        await self.session.commit()
        await self.session.refresh(inspection)
        return inspection

    async def create_with_transaction(self, inspection: Inspection) -> Inspection:
        """
        Creates an inspection using an explicit transaction block, rolling back on any failure.
        Useful for multi-step AI inference saves.
        """
        try:
            self.session.add(inspection)
            await self.session.commit()
            await self.session.refresh(inspection)
            return inspection
        except Exception as e:
            await self.session.rollback()
            raise e
            
    async def update(self, inspection: Inspection) -> Inspection:
        try:
            await self.session.commit()
            await self.session.refresh(inspection)
            return inspection
        except Exception as e:
            await self.session.rollback()
            raise e

    async def get_by_id(self, inspection_id: uuid.UUID) -> Inspection | None:
        result = await self.session.execute(
            select(Inspection).where(Inspection.id == inspection_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_by_device(self, device_id: uuid.UUID) -> Inspection | None:
        result = await self.session.execute(
            select(Inspection)
            .where(Inspection.device_id == device_id)
            .order_by(Inspection.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def list_by_device(
        self, device_id: uuid.UUID, limit: int = 100, offset: int = 0
    ) -> Sequence[Inspection]:
        result = await self.session.execute(
            select(Inspection)
            .where(Inspection.device_id == device_id)
            .order_by(Inspection.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
        
    async def search(
        self,
        user_id: uuid.UUID | None = None,
        device_id: uuid.UUID | None = None,
        status: str | None = None,
        brand: str | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> Sequence[Inspection]:
        """
        Advanced search for inspection history.
        """
        query = select(Inspection)
        
        conditions = []
        if user_id:
            conditions.append(Inspection.user_id == user_id)
        if device_id:
            conditions.append(Inspection.device_id == device_id)
        if status:
            conditions.append(Inspection.status == status)
        if brand:
            conditions.append(Inspection.device_brand.ilike(f"%{brand}%"))
        if from_date:
            conditions.append(Inspection.created_at >= from_date)
        if to_date:
            conditions.append(Inspection.created_at <= to_date)
            
        if conditions:
            query = query.where(and_(*conditions))
            
        query = query.order_by(Inspection.created_at.desc()).limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return result.scalars().all()
