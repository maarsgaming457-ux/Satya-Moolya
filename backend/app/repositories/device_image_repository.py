import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device_image import DeviceImage


class DeviceImageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, device_image: DeviceImage) -> DeviceImage:
        self.session.add(device_image)
        await self.session.commit()
        await self.session.refresh(device_image)
        return device_image

    async def list_by_device(
        self, device_id: uuid.UUID
    ) -> tuple[list[DeviceImage], int]:
        result = await self.session.execute(
            select(DeviceImage)
            .where(DeviceImage.device_id == device_id)
            .order_by(DeviceImage.image_order.asc(), DeviceImage.created_at.asc())
        )
        images = list(result.scalars().all())
        return images, len(images)

    async def count_by_device(self, device_id: uuid.UUID) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(DeviceImage)
            .where(DeviceImage.device_id == device_id)
        )
        return result.scalar_one()

    async def get_by_id_and_device(
        self, image_id: uuid.UUID, device_id: uuid.UUID
    ) -> DeviceImage | None:
        result = await self.session.execute(
            select(DeviceImage).where(
                DeviceImage.id == image_id,
                DeviceImage.device_id == device_id,
            )
        )
        return result.scalar_one_or_none()

    async def delete(self, device_image: DeviceImage) -> None:
        await self.session.delete(device_image)
        await self.session.commit()
