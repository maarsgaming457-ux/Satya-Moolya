import logging
import uuid
from collections.abc import Sequence

from fastapi import HTTPException, status

from app.models.notification import Notification
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(
        self,
        *,
        notification_repository: NotificationRepository,
    ) -> None:
        self.notification_repository = notification_repository

    async def create_notification(self, data: NotificationCreate) -> Notification:
        logger.info(f"Creating notification for user {data.user_id}: {data.title}")
        notification = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            type=data.type,
            is_read=False,
        )
        return await self.notification_repository.create(notification)

    async def get_user_notifications(
        self, current_user: User
    ) -> Sequence[Notification]:
        return await self.notification_repository.list_by_user(current_user.id)

    async def mark_as_read(
        self, notification_id: uuid.UUID, current_user: User
    ) -> Notification:
        notification = await self.notification_repository.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )

        if notification.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} tried to mark someone else's notification {notification_id} as read."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this notification.",
            )

        notification.is_read = True
        await self.notification_repository.session.commit()
        return notification

    async def mark_all_as_read(self, current_user: User) -> dict[str, str]:
        await self.notification_repository.mark_all_as_read(current_user.id)
        return {"status": "success", "message": "All notifications marked as read."}

    async def delete_notification(
        self, notification_id: uuid.UUID, current_user: User
    ) -> None:
        notification = await self.notification_repository.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )

        if notification.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} tried to delete someone else's notification {notification_id}."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this notification.",
            )

        await self.notification_repository.delete(notification)
