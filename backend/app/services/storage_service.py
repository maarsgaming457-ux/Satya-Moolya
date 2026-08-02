import mimetypes
import uuid
from typing import TYPE_CHECKING, Any

from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.device_image import DeviceImageUploadResult

if TYPE_CHECKING:
    from supabase import Client


class SupabaseStorageService:
    def __init__(self, client: "Client | None" = None) -> None:
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET
        self._client = client

    @property
    def client(self) -> Any:
        if self._client is None:
            self._client = self._create_client()
        return self._client

    async def upload_device_image(
        self,
        *,
        owner_id: uuid.UUID,
        device_id: uuid.UUID,
        filename: str,
        content: bytes,
        content_type: str | None,
    ) -> DeviceImageUploadResult:
        extension = filename.rsplit(".", 1)[-1].lower()
        storage_path = f"{owner_id}/devices/{device_id}/{uuid.uuid4()}.{extension}"
        resolved_content_type = (
            content_type
            or mimetypes.guess_type(filename)[0]
            or "application/octet-stream"
        )

        try:
            self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=content,
                file_options={
                    "content-type": resolved_content_type,
                    "upsert": "false",
                },
            )
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(
                storage_path
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to upload image to storage.",
            ) from exc

        return DeviceImageUploadResult(
            image_url=public_url,
            storage_path=storage_path,
        )

    async def upload_file(
        self,
        *,
        file_data: bytes,
        filename: str,
        content_type: str,
        folder: str
    ) -> str:
        """Uploads a generic file and returns the public URL."""
        storage_path = f"{folder}/{filename}"
        
        try:
            self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_data,
                file_options={
                    "content-type": content_type,
                    "upsert": "true",
                },
            )
            return self.client.storage.from_(self.bucket_name).get_public_url(
                storage_path
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unable to upload {filename} to storage.",
            ) from exc

    async def delete_device_image(self, storage_path: str) -> None:
        try:
            self.client.storage.from_(self.bucket_name).remove([storage_path])
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to delete image from storage.",
            ) from exc

    def _create_client(self) -> Any:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase storage settings are not configured.",
            )

        from supabase import create_client

        return create_client(
            str(settings.SUPABASE_URL),
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
