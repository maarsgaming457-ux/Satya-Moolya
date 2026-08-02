import logging
import uuid
from collections.abc import Sequence

from fastapi import HTTPException, status

from app.models.marketplace import ListingStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.repositories.marketplace_repository import MarketplaceRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate

logger = logging.getLogger(__name__)


class OrderService:
    def __init__(
        self,
        *,
        order_repository: OrderRepository,
        marketplace_repository: MarketplaceRepository,
    ) -> None:
        self.order_repository = order_repository
        self.marketplace_repository = marketplace_repository

    async def create_order(self, data: OrderCreate, current_user: User) -> Order:
        logger.info(
            f"User {current_user.id} attempting to create order for listing {data.listing_id}"
        )

        listing = await self.marketplace_repository.get_by_id(data.listing_id)
        if not listing:
            logger.warning(f"Listing {data.listing_id} not found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found.",
            )

        if listing.status != ListingStatus.ACTIVE:
            logger.warning(f"Listing {data.listing_id} is not ACTIVE.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Listing is no longer active and cannot be purchased.",
            )

        if listing.seller_id == current_user.id:
            logger.warning(
                f"User {current_user.id} tried to buy their own listing {data.listing_id}."
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot purchase your own listing.",
            )

        # Mark Listing as SOLD and create order in a single transaction
        listing.status = ListingStatus.SOLD

        # Create Order
        order = Order(
            listing_id=listing.id,
            buyer_id=current_user.id,
            seller_id=listing.seller_id,
            final_price=listing.price,
            status=OrderStatus.PENDING,
        )

        # This commit will save both the new order and the listing status change
        created_order = await self.order_repository.create(order)

        logger.info(
            f"Successfully created order {created_order.id} and marked listing as SOLD."
        )
        return created_order

    async def get_order(self, order_id: uuid.UUID, current_user: User) -> Order:
        order = await self.order_repository.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )

        if order.buyer_id != current_user.id and order.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order.",
            )

        return order

    async def get_buyer_orders(self, current_user: User) -> Sequence[Order]:
        return await self.order_repository.list_by_buyer(current_user.id)

    async def get_seller_orders(self, current_user: User) -> Sequence[Order]:
        return await self.order_repository.list_by_seller(current_user.id)
