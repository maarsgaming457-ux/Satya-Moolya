from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.dependencies.inspection import get_gemini_service, get_inspection_repository
from app.dependencies.marketplace import get_marketplace_repository
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.repositories.negotiation_repository import NegotiationRepository
from app.services.gemini_service import GeminiService
from app.services.negotiation_service import NegotiationService


def get_negotiation_repository(
    session: AsyncSession = Depends(get_session),
) -> NegotiationRepository:
    return NegotiationRepository(session)


def get_negotiation_service(
    negotiation_repository: NegotiationRepository = Depends(get_negotiation_repository),
    marketplace_repository: MarketplaceRepository = Depends(get_marketplace_repository),
    inspection_repository: InspectionRepository = Depends(get_inspection_repository),
    gemini_service: GeminiService = Depends(get_gemini_service),
) -> NegotiationService:
    return NegotiationService(
        negotiation_repository=negotiation_repository,
        marketplace_repository=marketplace_repository,
        inspection_repository=inspection_repository,
        gemini_service=gemini_service,
    )
