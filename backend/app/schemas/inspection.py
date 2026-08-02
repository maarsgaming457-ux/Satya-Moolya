import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DetectedDefect(BaseModel):
    type: str
    severity: str
    confidence: float = Field(ge=0, le=1)
    image_url: str | None = None
    notes: str
    image_id: str | None = None
    bounding_box: list[int] | None = None
    estimated_repair_cost: Decimal | None = None
    resale_deduction: Decimal | None = None


class PricingResult(BaseModel):
    estimated_price: Decimal
    confidence_score: int = Field(ge=0, le=100)
    trust_score: int = Field(ge=0, le=100)
    inspection_score: int = Field(ge=0, le=100)


class GeminiInspectionResult(BaseModel):
    inspection_score: int = Field(ge=0, le=100)
    trust_score: int = Field(ge=0, le=100)
    estimated_price: Decimal
    condition: str
    summary: str
    detected_issues: list[dict[str, Any]]
    confidence: float = Field(ge=0, le=1)
    valuation_breakdown: dict[str, Any] | None = None
    evidence_report: list[dict[str, Any]] | None = None
    trust_score_breakdown: dict[str, Any] | None = None
    evidence_schema: dict[str, Any] | None = None
    pricing_schema: dict[str, Any] | None = None
    claim_verification_results: dict[str, Any] | None = None


class InspectionResponse(BaseModel):
    id: uuid.UUID
    device_id: uuid.UUID
    inspection_score: int
    trust_score: int
    estimated_price: Decimal
    condition: str
    summary: str
    detected_issues: list[dict[str, Any]]
    functional_tests: dict[str, Any] | None = None
    valuation_breakdown: dict[str, Any] | None = None
    evidence_report: list[dict[str, Any]] | None = None
    trust_score_breakdown: dict[str, Any] | None = None
    evidence_schema: dict[str, Any] | None = None
    pricing_schema: dict[str, Any] | None = None
    claim_verification_results: dict[str, Any] | None = None
    confidence: float
    created_at: datetime
    
    # New persistence fields
    user_id: uuid.UUID | None = None
    device_brand: str | None = None
    device_model: str | None = None
    device_storage: str | None = None
    device_color: str | None = None
    status: str | None = None
    quality_metrics: dict[str, Any] | None = None
    tracking_results: dict[str, Any] | None = None
    component_detection: list[dict[str, Any]] | None = None
    damage_detection: list[dict[str, Any]] | None = None
    gemini_output: dict[str, Any] | None = None
    generated_files: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)
