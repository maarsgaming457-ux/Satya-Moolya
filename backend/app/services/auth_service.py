import uuid

from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def register(self, payload: UserCreate) -> User:
        existing_user = await self.user_repository.get_by_email(payload.email)
        if existing_user:
            if not existing_user.is_verified:
                existing_user.full_name = payload.full_name
                existing_user.phone = payload.phone
                existing_user.password_hash = hash_password(payload.password)
                existing_user.role = payload.role
                existing_user.is_active = True
                return await self.user_repository.save(existing_user)

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

        user = User(
            full_name=payload.full_name,
            email=payload.email.lower(),
            phone=payload.phone,
            password_hash=hash_password(payload.password),
            role=payload.role,
            is_verified=False,
            is_active=True,
        )
        return await self.user_repository.create(user)

    async def login(self, payload: UserLogin) -> TokenResponse:
        print("=== BACKEND LOGIN TRACE ===", flush=True)
        print("Incoming email:", payload.email, flush=True)
        user = await self.user_repository.get_by_email(payload.email)
        
        print("User found?", user is not None, flush=True)
        if user:
            print("Stored email:", user.email, flush=True)
        
        if not user:
            print("Returning HTTP status: 401 (User not found)", flush=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        is_valid_password = verify_password(payload.password, user.password_hash)
        print("Password verification result:", is_valid_password, flush=True)
        
        if not is_valid_password:
            print("Returning HTTP status: 401 (Incorrect password)", flush=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            print("Returning HTTP status: 403 (User inactive)", flush=True)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        access_token = create_access_token(subject=str(user.id))
        print("Returning HTTP status: 200 OK", flush=True)
        print("Returning response body: TokenResponse generated", flush=True)
        return TokenResponse(
            access_token=access_token, user=UserResponse.model_validate(user)
        )

    async def get_active_user(self, user_id: uuid.UUID) -> User:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        return user
