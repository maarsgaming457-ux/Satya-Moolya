import uuid

from fastapi import HTTPException, UploadFile, status

from app.models.device_image import DeviceImage
from app.models.user import User, UserRole
from app.repositories.device_image_repository import DeviceImageRepository
from app.repositories.device_repository import DeviceRepository
from app.schemas.device_image import DeviceImageListResponse, DeviceImageResponse
from app.services.storage_service import SupabaseStorageService

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
MAX_IMAGES_PER_DEVICE = 10


class DeviceImageService:
    def __init__(
        self,
        device_repository: DeviceRepository,
        device_image_repository: DeviceImageRepository,
        storage_service: SupabaseStorageService,
    ) -> None:
        self.device_repository = device_repository
        self.device_image_repository = device_image_repository
        self.storage_service = storage_service

    async def upload_image(
        self,
        device_id: uuid.UUID,
        image: UploadFile,
        current_user: User,
    ) -> DeviceImage:
        self._ensure_seller(current_user)
        await self._ensure_owned_device(device_id, current_user)

        image_count = await self.device_image_repository.count_by_device(device_id)
        if image_count >= MAX_IMAGES_PER_DEVICE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A device can have a maximum of 10 images.",
            )

        filename = image.filename or ""
        extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if extension not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only jpg, jpeg, png, and webp images are allowed.",
            )

        content = await image.read()
        if len(content) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image size must not exceed 10 MB.",
            )

        upload_result = await self.storage_service.upload_device_image(
            owner_id=current_user.id,
            device_id=device_id,
            filename=filename,
            content=content,
            content_type=image.content_type,
        )
        device_image = DeviceImage(
            device_id=device_id,
            image_url=upload_result.image_url,
            storage_path=upload_result.storage_path,
            image_order=image_count + 1,
        )
        return await self.device_image_repository.create(device_image)

    async def list_images(
        self, device_id: uuid.UUID, current_user: User
    ) -> DeviceImageListResponse:
        await self._ensure_owned_device(device_id, current_user)
        images, total = await self.device_image_repository.list_by_device(device_id)
        return DeviceImageListResponse(
            items=[DeviceImageResponse.model_validate(img) for img in images],
            total=total,
        )

    async def delete_image(
        self, device_id: uuid.UUID, image_id: uuid.UUID, current_user: User
    ) -> None:
        self._ensure_seller(current_user)
        await self._ensure_owned_device(device_id, current_user)

        device_image = await self.device_image_repository.get_by_id_and_device(
            image_id=image_id,
            device_id=device_id,
        )
        if not device_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device image not found.",
            )

        await self.storage_service.delete_device_image(device_image.storage_path)
        await self.device_image_repository.delete(device_image)

    async def _ensure_owned_device(
        self, device_id: uuid.UUID, current_user: User
    ) -> None:
        device = await self.device_repository.get_by_id_and_owner(
            device_id=device_id,
            owner_id=current_user.id,
        )
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found.",
            )

    def _ensure_seller(self, current_user: User) -> None:
        # In this C2C marketplace, any authenticated user can register a device to sell.
        pass
