import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.notification import get_notification_service
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(tags=["Notifications"])


@router.get(
    "/notifications",
    response_model=list[NotificationResponse],
)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Retrieves all notifications for the authenticated user."""
    return await notification_service.get_user_notifications(current_user)


@router.patch(
    "/notifications/{notification_id}/read",
    response_model=NotificationResponse,
)
async def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Marks a specific notification as read."""
    return await notification_service.mark_as_read(notification_id, current_user)


@router.patch(
    "/notifications/read-all",
    response_model=dict,
)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Marks all notifications for the authenticated user as read."""
    return await notification_service.mark_all_as_read(current_user)


@router.delete(
    "/notifications/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Deletes a specific notification."""
    await notification_service.delete_notification(notification_id, current_user)
