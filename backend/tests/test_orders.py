import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, UTC
from decimal import Decimal

from app.models.order import Order, OrderStatus
from app.models.marketplace import MarketplaceListing, ListingStatus

pytestmark = pytest.mark.asyncio


async def test_create_order(
    client: AsyncClient, mock_order_repo, mock_marketplace_repo, test_user
):
    listing_id = uuid.uuid4()
    seller_id = uuid.uuid4()  # Different user

    mock_marketplace_repo.get_by_id.return_value = MarketplaceListing(
        id=listing_id,
        device_id=uuid.uuid4(),
        seller_id=seller_id,
        price=Decimal("500.00"),
        status=ListingStatus.ACTIVE,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    mock_order_repo.create.return_value = Order(
        id=uuid.uuid4(),
        listing_id=listing_id,
        buyer_id=test_user.id,
        seller_id=seller_id,
        final_price=Decimal("500.00"),
        status=OrderStatus.PENDING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post("/api/v1/orders", json={"listing_id": str(listing_id)})

    assert response.status_code == 201
    assert response.json()["final_price"] == "500.00"
    assert mock_order_repo.create.called


async def test_buyer_cannot_purchase_own_listing(
    client: AsyncClient, mock_marketplace_repo, test_user
):
    listing_id = uuid.uuid4()

    mock_marketplace_repo.get_by_id.return_value = MarketplaceListing(
        id=listing_id,
        device_id=uuid.uuid4(),
        seller_id=test_user.id,  # Same user
        price=Decimal("500.00"),
        status=ListingStatus.ACTIVE,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post("/api/v1/orders", json={"listing_id": str(listing_id)})

    assert response.status_code == 400
    assert "You cannot purchase your own listing" in response.json()["detail"]


async def test_cannot_purchase_sold_listing(
    client: AsyncClient, mock_marketplace_repo, test_user
):
    listing_id = uuid.uuid4()

    mock_marketplace_repo.get_by_id.return_value = MarketplaceListing(
        id=listing_id,
        device_id=uuid.uuid4(),
        seller_id=uuid.uuid4(),
        price=Decimal("500.00"),
        status=ListingStatus.SOLD,  # Already sold
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post("/api/v1/orders", json={"listing_id": str(listing_id)})

    assert response.status_code == 400
    assert "is no longer active" in response.json()["detail"]


async def test_get_buyer_orders(client: AsyncClient, mock_order_repo, test_user):
    mock_order_repo.list_by_buyer.return_value = [
        Order(
            id=uuid.uuid4(),
            listing_id=uuid.uuid4(),
            buyer_id=test_user.id,
            seller_id=uuid.uuid4(),
            final_price=Decimal("100.00"),
            status=OrderStatus.PENDING,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
    ]

    response = await client.get("/api/v1/orders/me")
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_get_seller_orders(client: AsyncClient, mock_order_repo, test_user):
    mock_order_repo.list_by_seller.return_value = [
        Order(
            id=uuid.uuid4(),
            listing_id=uuid.uuid4(),
            buyer_id=uuid.uuid4(),
            seller_id=test_user.id,
            final_price=Decimal("100.00"),
            status=OrderStatus.PENDING,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
    ]

    response = await client.get("/api/v1/orders/sold")
    assert response.status_code == 200
    assert len(response.json()) == 1
