import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class NegotiationOfferCreate(BaseModel):
    listing_id: uuid.UUID
    offered_price: Decimal = Field(gt=0)


class NegotiationResponse(BaseModel):
    id: uuid.UUID
    listing_id: uuid.UUID
    buyer_id: uuid.UUID
    offered_price: Decimal
    suggested_counter_offer: Decimal
    acceptance_probability: int
    negotiation_summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
