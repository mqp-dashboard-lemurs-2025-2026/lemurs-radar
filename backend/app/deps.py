from fastapi import Request

from app.db import db_manager


async def get_db_connection(request: Request):
    """Give a route one database connection and return it after the request."""
    # FastAPI calls this for routes that ask for conn=Depends(...).
    conn = await db_manager.pool.acquire()
    try:
        yield conn
    finally:
        # Always return the connection so the pool does not run dry.
        await db_manager.pool.release(conn)
