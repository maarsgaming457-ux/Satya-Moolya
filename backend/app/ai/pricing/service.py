from decimal import Decimal
from typing import Any

from app.ai.pricing.base import PriceEstimator
from app.schemas.inspection import PricingResult


class PlaceholderPricingService(PriceEstimator):
    async def estimate(self, device_data: dict[str, Any]) -> PricingResult:
        purchase_year = int(device_data.get("purchase_year") or 2020)
        defect_count = len(device_data.get("defects") or [])

        base_price = Decimal("25000.00")
        age_penalty = Decimal(max(0, 2026 - purchase_year)) * Decimal("1800.00")
        defect_penalty = Decimal(defect_count) * Decimal("1500.00")
        estimated_price = max(
            Decimal("3000.00"), base_price - age_penalty - defect_penalty
        )

        inspection_score = max(30, 92 - (defect_count * 8))
        trust_score = max(40, 88 - (defect_count * 6))
        confidence_score = 76 if defect_count else 68

        return PricingResult(
            estimated_price=estimated_price,
            confidence_score=confidence_score,
            trust_score=trust_score,
            inspection_score=inspection_score,
        )
