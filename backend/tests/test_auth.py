import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, UTC

from app.models.user import User, UserRole

pytestmark = pytest.mark.asyncio


async def test_register_user(client: AsyncClient, mock_user_repo):
    mock_user_repo.get_by_email.return_value = None

    mock_user_repo.create.side_effect = lambda user: User(
        id=uuid.uuid4(),
        full_name=user.full_name,
        email=user.email,
        password_hash="hashed",
        role=user.role,
        is_verified=False,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "new@example.com",
            "password": "password123",
            "role": "buyer",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"
    assert mock_user_repo.create.called


async def test_register_duplicate_email(client: AsyncClient, mock_user_repo):
    mock_user_repo.get_by_email.return_value = User(
        id=uuid.uuid4(),
        full_name="Existing",
        email="existing@example.com",
        password_hash="hashed",
        role=UserRole.BUYER,
    )

    response = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "existing@example.com",
            "password": "password123",
            "role": "buyer",
        },
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


async def test_login_user(client: AsyncClient, mock_user_repo):
    from app.core.security import hash_password

    mock_user_repo.get_by_email.return_value = User(
        id=uuid.uuid4(),
        full_name="Existing",
        email="user@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.BUYER,
        is_verified=True,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


async def test_login_invalid_password(client: AsyncClient, mock_user_repo):
    from app.core.security import hash_password

    mock_user_repo.get_by_email.return_value = User(
        id=uuid.uuid4(),
        full_name="Existing",
        email="user@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.BUYER,
        is_verified=True,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]
