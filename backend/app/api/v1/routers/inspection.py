import uuid

from fastapi import APIRouter, Depends, status, BackgroundTasks

from app.dependencies.auth import get_current_user
from app.dependencies.inspection import get_inspection_service
from app.models.user import User
from app.schemas.inspection import InspectionResponse
from app.services.inspection_service import InspectionService
from pydantic import BaseModel
from typing import Any

class StartInspectionRequest(BaseModel):
    functional_tests: dict[str, Any] | None = None
    seller_claims: dict[str, Any] | None = None

router = APIRouter(tags=["Inspection"])

@router.post(
    "/inspections/{device_id}",
    response_model=InspectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_inspection(
    device_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    payload: StartInspectionRequest | None = None,
    current_user: User = Depends(get_current_user),
    inspection_service: InspectionService = Depends(get_inspection_service),
):
    """
    Starts an inspection for a device by sending all of its images to the AI analyzer.
    """
    functional_tests = payload.functional_tests if payload else None
    seller_claims = payload.seller_claims if payload else None
    return await inspection_service.create_inspection(
        device_id, current_user, background_tasks, functional_tests, seller_claims
    )


@router.get(
    "/inspections/{device_id}",
    response_model=InspectionResponse,
)
async def get_latest_inspection(
    device_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    inspection_service: InspectionService = Depends(get_inspection_service),
):
    """
    Retrieves the latest inspection for a device.
    """
    return await inspection_service.get_latest_inspection(device_id, current_user)


@router.get(
    "/inspections/history/{device_id}",
    response_model=list[InspectionResponse],
)
async def get_inspection_history(
    device_id: uuid.UUID,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    inspection_service: InspectionService = Depends(get_inspection_service),
):
    """
    Retrieves all past and present inspections for a device.
    """
    return await inspection_service.get_device_inspections(
        device_id, current_user, limit=limit, offset=offset
    )
