from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine

    if _engine is None:
        if "sqlite" in str(settings.DATABASE_URL):
            _engine = create_async_engine(
                settings.DATABASE_URL,
            )
        else:
            _engine = create_async_engine(
                settings.DATABASE_URL,
                pool_size=settings.DATABASE_POOL_SIZE,
                max_overflow=settings.DATABASE_MAX_OVERFLOW,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_timeout=30.0,
            )

    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker

    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )

    return _sessionmaker


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async_session_factory = get_sessionmaker()
    async with async_session_factory() as session:
        yield session


async def dispose_database() -> None:
    if _engine is not None:
        await _engine.dispose()
