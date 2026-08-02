from abc import ABC, abstractmethod
from typing import Any


class InspectionEngine(ABC):
    @abstractmethod
    async def inspect(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
