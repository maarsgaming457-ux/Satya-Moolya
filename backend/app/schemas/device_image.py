import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DeviceImageResponse(BaseModel):
    id: uuid.UUID
    device_id: uuid.UUID
    image_url: str
    storage_path: str
    image_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceImageListResponse(BaseModel):
    items: list[DeviceImageResponse]
    total: int


class DeviceImageUploadResult(BaseModel):
    image_url: str
    storage_path: str = Field(min_length=1)
