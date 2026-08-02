import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.order import get_order_service
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(tags=["Orders"])


@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """Creates a new order from an active marketplace listing."""
    return await order_service.create_order(data, current_user)


@router.get(
    "/orders/me",
    response_model=list[OrderResponse],
)
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """Retrieves all orders where the user is the buyer."""
    return await order_service.get_buyer_orders(current_user)


@router.get(
    "/orders/sold",
    response_model=list[OrderResponse],
)
async def get_my_sales(
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """Retrieves all orders where the user is the seller."""
    return await order_service.get_seller_orders(current_user)


@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
async def get_order_details(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """Retrieves order details (only accessible by buyer or seller)."""
    return await order_service.get_order(order_id, current_user)
