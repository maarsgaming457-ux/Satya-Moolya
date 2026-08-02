import logging
import uuid
from collections.abc import Sequence

from fastapi import HTTPException, status

from app.models.marketplace import ListingStatus, MarketplaceListing
from app.models.user import User
from app.repositories.device_repository import DeviceRepository
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.schemas.marketplace import MarketplaceListingCreate

logger = logging.getLogger(__name__)


class MarketplaceService:
    def __init__(
        self,
        *,
        marketplace_repository: MarketplaceRepository,
        device_repository: DeviceRepository,
        inspection_repository: InspectionRepository,
    ) -> None:
        self.marketplace_repository = marketplace_repository
        self.device_repository = device_repository
        self.inspection_repository = inspection_repository

    async def create_listing(
        self, data: MarketplaceListingCreate, current_user: User
    ) -> MarketplaceListing:
        logger.info(
            f"User {current_user.id} attempting to create listing for device {data.device_id}"
        )

        # 1. Validate device ownership
        device = await self.device_repository.get_by_id_and_owner(
            device_id=data.device_id, owner_id=current_user.id
        )
        if not device:
            logger.warning(
                f"Device {data.device_id} not found or unauthorized for user {current_user.id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or not owned by user.",
            )

        # 2. Ensure device has a completed inspection
        inspection = await self.inspection_repository.get_latest_by_device(device.id)
        if not inspection:
            logger.warning(f"Device {device.id} lacks an inspection.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device must have a completed inspection before listing.",
            )

        # 3. Ensure no active listing exists for this device
        existing_listing = await self.marketplace_repository.get_active_by_device(
            device.id
        )
        if existing_listing:
            logger.warning(f"Device {device.id} already has an active listing.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device already has an active listing.",
            )

        # 4. Create listing
        listing = MarketplaceListing(
            device_id=device.id,
            seller_id=current_user.id,
            price=data.price,
            description=data.description,
            status=ListingStatus.ACTIVE,
        )
        created = await self.marketplace_repository.create(listing)
        logger.info(f"Successfully created listing {created.id}")
        return created

    async def get_active_listings(
        self, limit: int = 100, offset: int = 0
    ) -> Sequence[MarketplaceListing]:
        return await self.marketplace_repository.list_active(limit=limit, offset=offset)

    async def get_listing(self, listing_id: uuid.UUID) -> MarketplaceListing:
        listing = await self.marketplace_repository.get_by_id(listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found.",
            )
        return listing

    async def remove_listing(self, listing_id: uuid.UUID, current_user: User) -> None:
        logger.info(f"User {current_user.id} attempting to remove listing {listing_id}")
        listing = await self.marketplace_repository.get_by_id(listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found.",
            )

        if listing.seller_id != current_user.id:
            logger.warning(
                f"User {current_user.id} unauthorized to remove listing {listing_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to remove this listing.",
            )

        await self.marketplace_repository.delete(listing)
        logger.info(f"Successfully removed listing {listing_id}")
