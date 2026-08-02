import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.exceptions import RequestValidationError, WebSocketRequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.devices import router as devices_router
from app.api.v1.routers.health import router as health_router
from app.api.v1.routers.inspection import router as inspection_router
from app.api.v1.routers.marketplace import router as marketplace_router
from app.api.v1.routers.negotiation import router as negotiation_router
from app.api.v1.routers.notifications import router as notifications_router
from app.api.v1.routers.orders import router as orders_router
from app.api.v1.routers.live_inspection import router as live_inspection_router
from app.api.ws.inspection_ws import router as inspection_ws_router
from app.api.rest.component_detection import router as component_detection_router
from app.api.rest.damage_detection import router as damage_detection_router
from app.api.rest.reasoning import router as reasoning_router
from app.api.rest.pricing import router as pricing_router
from app.api.rest.report import router as report_router
from app.core.config import settings
from app.core.database import dispose_database

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s API", settings.PROJECT_NAME)
    
    # Verify Supabase bucket configuration
    try:
        from app.services.storage_service import SupabaseStorageService
        storage = SupabaseStorageService()
        # Verify the client and bucket are accessible
        bucket = storage.client.storage.get_bucket(storage.bucket_name)
        logger.info(f"Successfully verified Supabase storage bucket: {storage.bucket_name}")
    except Exception as e:
        logger.error(f"Failed to verify Supabase storage bucket on startup: {e}")
        raise RuntimeError(f"Startup check failed: Unable to access Supabase bucket '{settings.SUPABASE_STORAGE_BUCKET}'. Please check credentials and bucket existence.") from e

    yield
    await dispose_database()
    logger.info("Stopped %s API", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

@app.exception_handler(WebSocketRequestValidationError)
async def validation_exception_handler(websocket: WebSocket, exc: WebSocketRequestValidationError):
    import traceback
    print("!!! CAUGHT WEBSOCKET VALIDATION ERROR !!!")
    print(f"Exception: {type(exc).__name__}")
    print(f"Details: {exc.errors()}")
    traceback.print_exc()
    await websocket.close(code=1008)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(devices_router, prefix=settings.API_V1_PREFIX)
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(inspection_router, prefix=settings.API_V1_PREFIX)
app.include_router(marketplace_router, prefix=settings.API_V1_PREFIX)
app.include_router(negotiation_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(live_inspection_router, prefix=settings.API_V1_PREFIX)
app.include_router(inspection_ws_router, prefix=settings.API_V1_PREFIX)
app.include_router(component_detection_router, prefix=settings.API_V1_PREFIX)
app.include_router(damage_detection_router, prefix=settings.API_V1_PREFIX)
app.include_router(reasoning_router, prefix=settings.API_V1_PREFIX)
app.include_router(pricing_router, prefix=settings.API_V1_PREFIX)
app.include_router(report_router, prefix=settings.API_V1_PREFIX)
