import uuid

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.dependencies.auth import get_current_user
from app.dependencies.device_images import get_device_image_service
from app.dependencies.devices import get_device_service
from app.models.device import Device
from app.models.device_image import DeviceImage
from app.models.user import User
from app.schemas.device import (
    DeviceCreate,
    DeviceListResponse,
    DeviceResponse,
    DeviceUpdate,
)
from app.schemas.device_image import DeviceImageListResponse, DeviceImageResponse
from app.services.device_image_service import DeviceImageService
from app.services.device_service import DeviceService

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(
    payload: DeviceCreate,
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Device:
    return await device_service.create_device(payload, current_user)


@router.get("", response_model=DeviceListResponse)
async def list_devices(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
) -> DeviceListResponse:
    return await device_service.list_devices(current_user, limit=limit, offset=offset)


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Device:
    return await device_service.get_device(device_id, current_user)


@router.patch("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: uuid.UUID,
    payload: DeviceUpdate,
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Device:
    return await device_service.update_device(device_id, payload, current_user)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
) -> None:
    await device_service.delete_device(device_id, current_user)


@router.post(
    "/{device_id}/images",
    response_model=DeviceImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_device_image(
    device_id: uuid.UUID,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    device_image_service: DeviceImageService = Depends(get_device_image_service),
) -> DeviceImage:
    return await device_image_service.upload_image(device_id, image, current_user)


@router.get("/{device_id}/images", response_model=DeviceImageListResponse)
async def list_device_images(
    device_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    device_image_service: DeviceImageService = Depends(get_device_image_service),
) -> DeviceImageListResponse:
    return await device_image_service.list_images(device_id, current_user)


@router.delete(
    "/{device_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_device_image(
    device_id: uuid.UUID,
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    device_image_service: DeviceImageService = Depends(get_device_image_service),
) -> None:
    await device_image_service.delete_image(device_id, image_id, current_user)
