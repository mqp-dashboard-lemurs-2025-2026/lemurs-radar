import asyncpg
import os

# Docker Compose names the database service "db", so this default works in containers.
# Production should pass DATABASE_URL from the environment.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lemurs:lemurs@db/lemurs")


class Database:
    """Small wrapper around the shared asyncpg connection pool."""

    def __init__(self, database_url: str):
        self.database_url = database_url
        # Filled during FastAPI startup and reused by route handlers.
        self.pool = None

    async def connect(self):
        """Create the connection pool on application startup."""
        self.pool = await asyncpg.create_pool(self.database_url)
        print("Database connection pool created.")

    async def disconnect(self):
        """Close the connection pool on application shutdown."""
        if self.pool:
            await self.pool.close()
            print("Database connection pool closed.")


# One manager is shared by startup, shutdown, and request dependencies.
db_manager = Database(DATABASE_URL)
