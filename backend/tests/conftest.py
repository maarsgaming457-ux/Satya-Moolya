import uuid
from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_session
from app.dependencies.devices import get_device_repository
from app.dependencies.marketplace import get_marketplace_repository
from app.dependencies.order import get_order_repository
from app.dependencies.notification import get_notification_repository
from app.main import app
from app.models.user import User, UserRole


@pytest.fixture
def test_user() -> User:
    user = User(
        id=uuid.uuid4(),
        full_name="Test User",
        email="test@example.com",
        password_hash="hashed",
        role=UserRole.SELLER,
        is_verified=True,
        is_active=True,
    )
    return user


@pytest.fixture
def mock_session():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_device_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_marketplace_repo():
    mock = AsyncMock()
    mock.session = AsyncMock()
    return mock


@pytest.fixture
def mock_order_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_notification_repo():
    mock = AsyncMock()
    mock.session = AsyncMock()
    return mock


@pytest.fixture
def mock_user_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_negotiation_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_inspection_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def mock_device_image_repo():
    mock = AsyncMock()
    return mock


@pytest.fixture
def app_with_overrides(
    test_user,
    mock_session,
    mock_device_repo,
    mock_marketplace_repo,
    mock_order_repo,
    mock_notification_repo,
    mock_user_repo,
    mock_negotiation_repo,
    mock_inspection_repo,
    mock_device_image_repo,
) -> FastAPI:
    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_session] = lambda: mock_session

    # Normally we would override the repository dependencies directly
    # but the service dependencies fetch from get_session.
    # If the app uses get_session, they get our mock session.
    # To be safe, we'll override the repo dependencies themselves.
    from app.dependencies.devices import get_device_repository
    from app.dependencies.marketplace import get_marketplace_repository
    from app.dependencies.order import get_order_repository
    from app.dependencies.notification import get_notification_repository
    from app.dependencies.auth import get_user_repository
    from app.dependencies.device_images import get_device_image_repository

    app.dependency_overrides[get_device_repository] = lambda: mock_device_repo
    app.dependency_overrides[get_marketplace_repository] = lambda: mock_marketplace_repo
    app.dependency_overrides[get_order_repository] = lambda: mock_order_repo
    app.dependency_overrides[get_notification_repository] = lambda: (
        mock_notification_repo
    )
    app.dependency_overrides[get_user_repository] = lambda: mock_user_repo

    # Negotiation, Inspection, DeviceImage might not have explicit dependencies yet
    # But if they do:
    # app.dependency_overrides[get_negotiation_repository] = lambda: mock_negotiation_repo
    # app.dependency_overrides[get_inspection_repository] = lambda: mock_inspection_repo
    # app.dependency_overrides[get_device_image_repository] = lambda: mock_device_image_repo

    yield app
    app.dependency_overrides.clear()


import pytest_asyncio


@pytest_asyncio.fixture
async def client(app_with_overrides) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app_with_overrides), base_url="http://testserver"
    ) as c:
        yield c
