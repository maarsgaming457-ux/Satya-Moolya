import uuid

from fastapi import HTTPException, status

from app.models.device import Device, DeviceStatus
from app.models.user import User, UserRole
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import (
    DeviceCreate,
    DeviceListResponse,
    DeviceUpdate,
    DeviceResponse,
)


class DeviceService:
    def __init__(self, device_repository: DeviceRepository) -> None:
        self.device_repository = device_repository

    async def create_device(self, payload: DeviceCreate, current_user: User) -> Device:
        self._ensure_seller(current_user)

        device = Device(
            owner_id=current_user.id,
            brand=payload.brand,
            model=payload.model,
            category=payload.category,
            serial_number=payload.serial_number,
            purchase_year=payload.purchase_year,
            condition=payload.condition,
            description=payload.description,
            status=DeviceStatus.DRAFT,
        )
        return await self.device_repository.create(device)

    async def list_devices(
        self, current_user: User, limit: int = 100, offset: int = 0
    ) -> DeviceListResponse:
        devices, total = await self.device_repository.list_by_owner(
            current_user.id, limit=limit, offset=offset
        )
        return DeviceListResponse(
            items=[DeviceResponse.model_validate(d) for d in devices], total=total
        )

    async def get_device(self, device_id: uuid.UUID, current_user: User) -> Device:
        return await self._get_owned_device(device_id, current_user)

    async def update_device(
        self, device_id: uuid.UUID, payload: DeviceUpdate, current_user: User
    ) -> Device:
        self._ensure_seller(current_user)
        device = await self._get_owned_device(device_id, current_user)
        values = payload.model_dump(exclude_unset=True)
        if not values:
            return device

        return await self.device_repository.update(device, values)

    async def delete_device(self, device_id: uuid.UUID, current_user: User) -> None:
        self._ensure_seller(current_user)
        device = await self._get_owned_device(device_id, current_user)
        await self.device_repository.delete(device)

    async def _get_owned_device(
        self, device_id: uuid.UUID, current_user: User
    ) -> Device:
        device = await self.device_repository.get_by_id_and_owner(
            device_id=device_id,
            owner_id=current_user.id,
        )
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found.",
            )

        return device

    def _ensure_seller(self, current_user: User) -> None:
        # In this C2C marketplace, any authenticated user can register a device to sell.
        pass
