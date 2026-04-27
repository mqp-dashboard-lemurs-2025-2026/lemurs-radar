import asyncpg
from fastapi import APIRouter, Depends

from app.deps import get_db_connection

router = APIRouter()


@router.get("/clinicians")
async def get_clinicians(conn: asyncpg.Connection = Depends(get_db_connection)):
    query = "SELECT DISTINCT clinician FROM umass_id WHERE clinician IS NOT NULL ORDER BY clinician;"
    rows = await conn.fetch(query)
    return [row["clinician"] for row in rows]
