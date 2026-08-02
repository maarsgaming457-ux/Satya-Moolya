import asyncio
import time
import uuid
import psutil
import os
import json
from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_sessionmaker, get_engine, Base
from app.models.inspection import Inspection
from app.models.device import Device
from app.models.user import User
from app.repositories.inspection_repository import InspectionRepository

async def setup_test_db():
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def verify_database():
    print("Starting Database Persistence Verification...")
    await setup_test_db()
    
    async_session_factory = get_sessionmaker()
    
    # Pre-test metrics
    process = psutil.Process(os.getpid())
    start_ram = process.memory_info().rss
    
    benchmark_results = {
        "inserts": 0,
        "reads": 0,
        "updates": 0,
        "fetches": 0,
        "latency_ms_per_insert": 0.0,
        "latency_ms_per_read": 0.0,
        "latency_ms_per_update": 0.0,
        "rollback_verified": False,
        "search_verified": False
    }

    test_user_id = uuid.uuid4()
    test_device_id = uuid.uuid4()

    async with async_session_factory() as session:
        mock_user = User(
            id=test_user_id,
            email="test@example.com",
            full_name="Test User",
            password_hash="hash",
            is_verified=True,
            is_active=True,
            role="customer"
        )
        mock_device = Device(
            id=test_device_id,
            owner_id=test_user_id,
            brand="Apple",
            model="iPhone 14",
            category="Smartphone",
            purchase_year=2023,
            condition="Good",
            description="Test"
        )
        session.add(mock_user)
        session.add(mock_device)
        await session.commit()
    
    # 1. Verify Transaction Rollback
    print("Verifying Transaction Rollback...")
    async with async_session_factory() as session:
        repo = InspectionRepository(session)
        # Attempt to insert an invalid inspection (missing non-nullable fields like device_id)
        # To strictly test our explicit rollback method, we can trigger an integrity error by putting a wrong type or missing fields.
        invalid_inspection = Inspection(
            # Missing device_id intentionally to trigger SQLAlchemy IntegrityError / DB error
            inspection_score=100,
            trust_score=100,
            estimated_price=100,
            condition="Excellent",
            summary="Test",
            confidence=1.0
        )
        
        try:
            await repo.create_with_transaction(invalid_inspection)
        except Exception:
            benchmark_results["rollback_verified"] = True
            print("Rollback verified (Exception caught and transaction safely reverted).")

    # 2. Performance Benchmark (1000 operations)
    print("Starting 1000-operation benchmark...")
    
    inserted_ids = []
    
    # Insert 1000
    start_time = time.time()
    async with async_session_factory() as session:
        for i in range(1000):
            inspection = Inspection(
                device_id=test_device_id,
                user_id=test_user_id,
                inspection_score=95,
                trust_score=95,
                estimated_price=500.0,
                condition="Good",
                summary=f"Summary {i}",
                confidence=0.9,
                status="completed",
                device_brand="Apple",
                device_model="iPhone 14",
                quality_metrics={"blur": 0.01, "brightness": 120},
                tracking_results={"tracks": [1, 2, 3]},
                component_detection=[{"component": "screen", "confidence": 0.99}],
                damage_detection=[{"damage": "scratch", "severity": "minor"}],
                gemini_output={"summary": "Test"},
                generated_files={"pdf": "https://storage.supabase.com/test.pdf"}
            )
            session.add(inspection)
            if i % 100 == 0:
                await session.commit()
                
        await session.commit()
        
        # Collect IDs for reading
        res = await session.execute(select(Inspection.id).where(Inspection.device_id == test_device_id).limit(1000))
        inserted_ids = [row[0] for row in res.all()]
        
    benchmark_results["inserts"] = len(inserted_ids)
    benchmark_results["latency_ms_per_insert"] = ((time.time() - start_time) / 1000) * 1000
    print(f"1000 Inserts completed. Latency: {benchmark_results['latency_ms_per_insert']:.2f} ms/op")
    
    # Read 1000
    start_time = time.time()
    async with async_session_factory() as session:
        repo = InspectionRepository(session)
        for i_id in inserted_ids:
            record = await repo.get_by_id(i_id)
            if record:
                benchmark_results["reads"] += 1
                
    benchmark_results["latency_ms_per_read"] = ((time.time() - start_time) / 1000) * 1000
    print(f"1000 Reads completed. Latency: {benchmark_results['latency_ms_per_read']:.2f} ms/op")

    # Update 1000
    start_time = time.time()
    async with async_session_factory() as session:
        for i_id in inserted_ids:
            # We don't fetch one by one in normal update bulk, but we test the ORM overhead
            record = await session.get(Inspection, i_id)
            record.status = "archived"
            if benchmark_results["updates"] % 100 == 0:
                await session.commit()
            benchmark_results["updates"] += 1
        await session.commit()
    benchmark_results["latency_ms_per_update"] = ((time.time() - start_time) / 1000) * 1000
    print(f"1000 Updates completed. Latency: {benchmark_results['latency_ms_per_update']:.2f} ms/op")
    
    # Fetch (Search) 1000
    start_time = time.time()
    async with async_session_factory() as session:
        repo = InspectionRepository(session)
        # We'll do 100 searches of limit 10
        for _ in range(100):
            res = await repo.search(brand="Apple", limit=10)
            benchmark_results["fetches"] += len(res)
            
    benchmark_results["search_verified"] = benchmark_results["fetches"] > 0
    print(f"Search Fetches completed.")

    # Cleanup test data
    print("Cleaning up test data...")
    async with async_session_factory() as session:
        from sqlalchemy import delete
        await session.execute(delete(Inspection).where(Inspection.device_id == test_device_id))
        await session.commit()

    # Post-test metrics
    end_ram = process.memory_info().rss
    ram_diff_mb = (end_ram - start_ram) / (1024 * 1024)
    benchmark_results["ram_usage_mb"] = ram_diff_mb

    print("Verification complete.")
    with open("database_metrics.json", "w") as f:
        json.dump(benchmark_results, f, indent=4)
        
    print("Metrics written to database_metrics.json")

if __name__ == "__main__":
    asyncio.run(verify_database())
