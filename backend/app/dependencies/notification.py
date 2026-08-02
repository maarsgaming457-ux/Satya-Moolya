from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_session
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService


def get_notification_repository(
    session: AsyncSession = Depends(get_session),
) -> NotificationRepository:
    return NotificationRepository(session)


def get_notification_service(
    notification_repository: NotificationRepository = Depends(
        get_notification_repository
    ),
) -> NotificationService:
    return NotificationService(
        notification_repository=notification_repository,
    )
