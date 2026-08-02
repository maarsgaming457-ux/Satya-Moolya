import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, Boolean, func
from sqlalchemy import JSON as JSONB, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DeviceStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_INSPECTION = "pending_inspection"
    INSPECTED = "inspected"
    LISTED = "listed"
    SOLD = "sold"


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    brand: Mapped[str] = mapped_column(String(120), nullable=False)
    model: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(120), nullable=True)
    purchase_year: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_capacity: Mapped[str] = mapped_column(String(50), nullable=True)
    ram: Mapped[str] = mapped_column(String(50), nullable=True)
    accessories: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    has_invoice: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_warranty: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    condition: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(
        Enum(
            DeviceStatus,
            name="device_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=DeviceStatus.DRAFT,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    owner = relationship("User")
