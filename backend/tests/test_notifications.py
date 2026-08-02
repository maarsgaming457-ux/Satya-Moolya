import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, UTC

from app.models.notification import Notification, NotificationType

pytestmark = pytest.mark.asyncio


async def test_get_notifications(
    client: AsyncClient, mock_notification_repo, test_user
):
    mock_notification_repo.list_by_user.return_value = [
        Notification(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test",
            message="Test Message",
            type=NotificationType.INFO,
            is_read=False,
            created_at=datetime.now(UTC),
        )
    ]

    response = await client.get("/api/v1/notifications")
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_mark_as_read(client: AsyncClient, mock_notification_repo, test_user):
    notification_id = uuid.uuid4()
    notification = Notification(
        id=notification_id,
        user_id=test_user.id,
        title="Test",
        message="Test Message",
        type=NotificationType.INFO,
        is_read=False,
        created_at=datetime.now(UTC),
    )
    mock_notification_repo.get_by_id.return_value = notification

    response = await client.patch(f"/api/v1/notifications/{notification_id}/read")
    assert response.status_code == 200
    assert response.json()["is_read"] is True
    assert notification.is_read is True
    assert mock_notification_repo.session.commit.called


async def test_mark_all_as_read(client: AsyncClient, mock_notification_repo, test_user):
    response = await client.patch("/api/v1/notifications/read-all")
    assert response.status_code == 200
    assert mock_notification_repo.mark_all_as_read.called


async def test_delete_notification(
    client: AsyncClient, mock_notification_repo, test_user
):
    notification_id = uuid.uuid4()
    notification = Notification(
        id=notification_id,
        user_id=test_user.id,
        title="Test",
        message="Test Message",
        type=NotificationType.INFO,
        is_read=False,
        created_at=datetime.now(UTC),
    )
    mock_notification_repo.get_by_id.return_value = notification

    response = await client.delete(f"/api/v1/notifications/{notification_id}")
    assert response.status_code == 204
    assert mock_notification_repo.delete.called
