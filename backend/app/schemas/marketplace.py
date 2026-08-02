import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.marketplace import ListingStatus


class MarketplaceListingCreate(BaseModel):
    device_id: uuid.UUID
    price: Decimal = Field(gt=0)
    description: str | None = None


class MarketplaceListingResponse(BaseModel):
    id: uuid.UUID
    device_id: uuid.UUID
    seller_id: uuid.UUID
    price: Decimal
    description: str | None
    status: ListingStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
