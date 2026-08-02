import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.marketplace import get_marketplace_service
from app.models.user import User
from app.schemas.marketplace import MarketplaceListingCreate, MarketplaceListingResponse
from app.services.marketplace_service import MarketplaceService

router = APIRouter(tags=["Marketplace"])


@router.post(
    "/marketplace",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_listing(
    data: MarketplaceListingCreate,
    current_user: User = Depends(get_current_user),
    marketplace_service: MarketplaceService = Depends(get_marketplace_service),
):
    """Creates a new marketplace listing for an inspected device."""
    return await marketplace_service.create_listing(data, current_user)


@router.get(
    "/marketplace",
    response_model=list[MarketplaceListingResponse],
)
async def get_active_listings(
    limit: int = 100,
    offset: int = 0,
    marketplace_service: MarketplaceService = Depends(get_marketplace_service),
):
    """Retrieves all active marketplace listings."""
    return await marketplace_service.get_active_listings(limit=limit, offset=offset)


@router.get(
    "/marketplace/{listing_id}",
    response_model=MarketplaceListingResponse,
)
async def get_listing(
    listing_id: uuid.UUID,
    marketplace_service: MarketplaceService = Depends(get_marketplace_service),
):
    """Retrieves details of a specific listing."""
    return await marketplace_service.get_listing(listing_id)


@router.delete(
    "/marketplace/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_listing(
    listing_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    marketplace_service: MarketplaceService = Depends(get_marketplace_service),
):
    """Removes a listing (only the seller can perform this)."""
    await marketplace_service.remove_listing(listing_id, current_user)
