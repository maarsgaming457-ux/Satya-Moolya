from abc import ABC, abstractmethod
from typing import Any

from app.schemas.inspection import PricingResult


class PriceEstimator(ABC):
    @abstractmethod
    async def estimate(self, device_data: dict[str, Any]) -> PricingResult:
        raise NotImplementedError
