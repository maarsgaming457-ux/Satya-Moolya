import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.device import DeviceStatus


class DeviceBase(BaseModel):
    brand: str = Field(min_length=1, max_length=120)
    model: str = Field(min_length=1, max_length=160)
    category: str = Field(min_length=1, max_length=120)
    serial_number: str | None = Field(default=None, max_length=120)
    purchase_year: int = Field(ge=1990, le=2100)
    condition: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=1, max_length=5000)
    storage_capacity: str | None = None
    ram: str | None = None
    accessories: list[str] = Field(default_factory=list)
    has_invoice: bool = False
    has_warranty: bool = False


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    brand: str | None = Field(default=None, min_length=1, max_length=120)
    model: str | None = Field(default=None, min_length=1, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=120)
    serial_number: str | None = Field(default=None, max_length=120)
    purchase_year: int | None = Field(default=None, ge=1990, le=2100)
    condition: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    storage_capacity: str | None = None
    ram: str | None = None
    accessories: list[str] | None = None
    has_invoice: bool | None = None
    has_warranty: bool | None = None
    status: DeviceStatus | None = None


class DeviceResponse(DeviceBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    status: DeviceStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceListResponse(BaseModel):
    items: list[DeviceResponse]
    total: int
