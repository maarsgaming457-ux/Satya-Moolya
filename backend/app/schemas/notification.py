import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id: uuid.UUID
    title: str
    message: str
    type: NotificationType = NotificationType.INFO


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
