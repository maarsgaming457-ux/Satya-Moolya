import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, UTC
from decimal import Decimal

from app.models.negotiation import Negotiation
from app.models.marketplace import MarketplaceListing, ListingStatus

pytestmark = pytest.mark.asyncio


async def test_submit_offer(client: AsyncClient, mock_marketplace_repo, test_user):
    pass


async def test_submit_offer_invalid_listing(client: AsyncClient, test_user):
    pass
