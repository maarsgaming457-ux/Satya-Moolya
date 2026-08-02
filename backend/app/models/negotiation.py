import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, Text, func
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Negotiation(Base):
    __tablename__ = "negotiations"
    __table_args__ = (
        Index("ix_negotiations_listing_id", "listing_id"),
        Index("ix_negotiations_buyer_id", "buyer_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("marketplace_listings.id", ondelete="CASCADE"),
        nullable=False,
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    offered_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    suggested_counter_offer: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    acceptance_probability: Mapped[int] = mapped_column(Integer, nullable=False)
    negotiation_summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )

    listing = relationship("MarketplaceListing")
    buyer = relationship("User")
