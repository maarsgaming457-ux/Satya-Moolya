from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    return HealthCheckResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        environment=settings.ENVIRONMENT,
    )
