import uuid

from fastapi import APIRouter, Depends, status, BackgroundTasks

from app.dependencies.auth import get_current_user
from app.dependencies.negotiation import get_negotiation_service
from app.models.user import User
from app.schemas.negotiation import NegotiationOfferCreate, NegotiationResponse
from app.services.negotiation_service import NegotiationService

router = APIRouter(tags=["Negotiation"])


@router.post(
    "/negotiations",
    response_model=NegotiationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_offer(
    data: NegotiationOfferCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    """Submits a buyer offer for a marketplace listing and evaluates it using AI."""
    return await negotiation_service.submit_offer(data, current_user, background_tasks)


@router.get(
    "/negotiations/me",
    response_model=list[NegotiationResponse],
)
async def get_my_negotiations(
    status: str | None = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    """Retrieves all negotiations for the authenticated user."""
    return await negotiation_service.get_user_negotiations(
        current_user, status=status, limit=limit, offset=offset
    )


@router.get(
    "/negotiations/{listing_id}",
    response_model=list[NegotiationResponse],
)
async def get_negotiation_history(
    listing_id: uuid.UUID,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    negotiation_service: NegotiationService = Depends(get_negotiation_service),
):
    """Retrieves the negotiation history for a specific listing."""
    return await negotiation_service.get_negotiation_history(
        listing_id, current_user, limit=limit, offset=offset
    )
