import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, UTC

from app.models.device import Device, DeviceStatus

pytestmark = pytest.mark.asyncio


async def test_create_device(client: AsyncClient, mock_device_repo, test_user):
    mock_device_repo.create.return_value = Device(
        id=uuid.uuid4(),
        owner_id=test_user.id,
        brand="Apple",
        model="iPhone 13",
        category="Smartphone",
        purchase_year=2021,
        condition="Good",
        description="Works fine",
        status=DeviceStatus.DRAFT,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.post(
        "/api/v1/devices",
        json={
            "brand": "Apple",
            "model": "iPhone 13",
            "category": "Smartphone",
            "purchase_year": 2021,
            "condition": "Good",
            "description": "Works fine",
            "serial_number": "XYZ123",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["brand"] == "Apple"
    assert mock_device_repo.create.called


async def test_get_device(client: AsyncClient, mock_device_repo, test_user):
    device_id = uuid.uuid4()
    mock_device_repo.get_by_id_and_owner.return_value = Device(
        id=device_id,
        owner_id=test_user.id,
        brand="Samsung",
        model="Galaxy S21",
        category="Smartphone",
        purchase_year=2021,
        condition="Good",
        description="Like new",
        status=DeviceStatus.DRAFT,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.get(f"/api/v1/devices/{device_id}")
    assert response.status_code == 200
    assert response.json()["brand"] == "Samsung"


async def test_get_device_forbidden(client: AsyncClient, mock_device_repo):
    device_id = uuid.uuid4()
    mock_device_repo.get_by_id_and_owner.return_value = None

    response = await client.get(f"/api/v1/devices/{device_id}")
    assert response.status_code == 404


async def test_delete_device(client: AsyncClient, mock_device_repo, test_user):
    device_id = uuid.uuid4()
    mock_device_repo.get_by_id_and_owner.return_value = Device(
        id=device_id,
        owner_id=test_user.id,
        brand="Apple",
        model="iPad",
        category="Tablet",
        purchase_year=2020,
        condition="Good",
        description="Good",
        status=DeviceStatus.DRAFT,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    response = await client.delete(f"/api/v1/devices/{device_id}")
    assert response.status_code == 204
    assert mock_device_repo.delete.called
