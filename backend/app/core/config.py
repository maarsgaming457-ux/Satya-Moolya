from functools import lru_cache

from pydantic import AnyUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Satya Moolya"
    PROJECT_DESCRIPTION: str = "AI-powered marketplace for pre-owned electronics."
    API_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "local"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/satya_moolya"
    )
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    SUPABASE_URL: AnyUrl
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "device-images"

    GEMINI_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_AUDIENCE: str | None = None
    JWT_ISSUER: str | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: list[str]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def validate_cors_origins(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("CORS_ORIGINS cannot be empty.")
        if "*" in value:
            raise ValueError("CORS_ORIGINS cannot contain '*' for security reasons. Please specify exact origins.")
        return value

    @field_validator("JWT_SECRET_KEY", mode="before")
    @classmethod
    def validate_jwt_secret_key(cls, value: str | None) -> str:
        if not value or value == "replace-with-a-long-random-secret" or value == "change-me-in-production":
            raise ValueError("JWT_SECRET_KEY environment variable is missing or insecure. You must provide a strong, random secret key.")
        return value

    @field_validator(
        "GEMINI_API_KEY",
        "JWT_AUDIENCE",
        "JWT_ISSUER",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, value: str | None) -> str | None:
        if value == "":
            return None
        return value

    @field_validator("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", mode="before")
    @classmethod
    def validate_supabase_credentials(cls, value: str | None) -> str:
        if not value:
            raise ValueError("Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are required for image storage.")
        return str(value)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
