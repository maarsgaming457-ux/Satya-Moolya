from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_auth_service, get_current_user
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    return await auth_service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await auth_service.login(payload)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: User = Depends(get_current_user)):
    """Logs out the current user."""
    return {"message": "Successfully logged out"}
