import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device


class DeviceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, device: Device) -> Device:
        self.session.add(device)
        await self.session.commit()
        await self.session.refresh(device)
        return device

    async def list_by_owner(
        self, owner_id: uuid.UUID, limit: int = 100, offset: int = 0
    ) -> tuple[list[Device], int]:
        total_result = await self.session.execute(
            select(func.count()).select_from(Device).where(Device.owner_id == owner_id)
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Device)
            .where(Device.owner_id == owner_id)
            .order_by(Device.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def get_by_id_and_owner(
        self, device_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Device | None:
        result = await self.session.execute(
            select(Device).where(Device.id == device_id, Device.owner_id == owner_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, device_id: uuid.UUID) -> Device | None:
        result = await self.session.execute(
            select(Device).where(Device.id == device_id)
        )
        return result.scalar_one_or_none()

    async def update(self, device: Device, values: dict) -> Device:
        for field, value in values.items():
            setattr(device, field, value)

        await self.session.commit()
        await self.session.refresh(device)
        return device

    async def delete(self, device: Device) -> None:
        await self.session.delete(device)
        await self.session.commit()
