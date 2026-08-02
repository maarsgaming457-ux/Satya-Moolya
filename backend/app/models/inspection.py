import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy import JSON as JSONB, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False
    )
    inspection_score: Mapped[int] = mapped_column(Integer, nullable=False)
    trust_score: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    condition: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    detected_issues: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    functional_tests: Mapped[dict] = mapped_column(JSONB, nullable=True)
    valuation_breakdown: Mapped[dict] = mapped_column(JSONB, nullable=True)
    evidence_report: Mapped[list] = mapped_column(JSONB, nullable=True)
    trust_score_breakdown: Mapped[dict] = mapped_column(JSONB, nullable=True)
    evidence_schema: Mapped[dict] = mapped_column(JSONB, nullable=True)
    pricing_schema: Mapped[dict] = mapped_column(JSONB, nullable=True)
    claim_verification_results: Mapped[dict] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    
    # Device Metadata at time of inspection
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    device_brand: Mapped[str] = mapped_column(String(120), nullable=True)
    device_model: Mapped[str] = mapped_column(String(160), nullable=True)
    device_storage: Mapped[str] = mapped_column(String(50), nullable=True)
    device_color: Mapped[str] = mapped_column(String(50), nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="completed")
    
    # AI Outputs and Metrics
    quality_metrics: Mapped[dict] = mapped_column(JSONB, nullable=True)
    tracking_results: Mapped[dict] = mapped_column(JSONB, nullable=True)
    component_detection: Mapped[list] = mapped_column(JSONB, nullable=True)
    damage_detection: Mapped[list] = mapped_column(JSONB, nullable=True)
    gemini_output: Mapped[dict] = mapped_column(JSONB, nullable=True)
    
    # Generated Files
    generated_files: Mapped[dict] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )

    device = relationship("Device")
    user = relationship("User")
