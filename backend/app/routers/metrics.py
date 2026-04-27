import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_db_connection

router = APIRouter()


@router.get("/health_metrics/{app_user_id}")
async def read_user_health_metrics(
    app_user_id: int,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    query = """
    SELECT
        hm.app_user_id,
        hm.date,
        hm.screentime_minutes,
        hm.steps,
        hm.sleep_minutes,
        hm.bluetooth_devices_count
    FROM health_metrics AS hm
    WHERE hm.app_user_id = $1
    ORDER BY hm.date ASC
    """
    try:
        rows = await conn.fetch(query, app_user_id)
        if not rows:
            raise HTTPException(status_code=404, detail="No health metrics found for this user")

        # Convert Record objects to plain dicts
        return [dict(row) for row in rows]

    except Exception as e:
        print(f"Database Error (health_metrics): {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
