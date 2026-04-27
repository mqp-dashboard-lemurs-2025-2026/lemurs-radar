from typing import Any, Dict, List

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_db_connection
from app.utils.display import process_danger_for_display

router = APIRouter()


@router.get("/danger_reason/{app_user_id}")
async def fetch_danger_reason_by_user_id(
    app_user_id: int,
    conn: asyncpg.Connection = Depends(get_db_connection),
) -> List[Dict[str, Any]]:
    """
    Fetch danger alert details for a specific user from the view.
    Displays the related question, user's answer, timestamp, and alert message.
    """
    # added explicit cast to int to avoid type mismatch in the view
    query = """
        SELECT question, answer, created_at, alert_message
        FROM all_danger_alert
        WHERE app_user_id = $1::int
        ORDER BY created_at DESC
    """
    try:
        rows = await conn.fetch(query, app_user_id)
        results: List[Dict[str, Any]] = [dict(r) for r in rows]
        # return 404 if no rows found
        if not results:
            raise HTTPException(status_code=404, detail="No danger alerts found for this user")
        return process_danger_for_display(results)
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/danger_alert")
async def get_all_alerts(conn: asyncpg.Connection = Depends(get_db_connection)):
    query = """
        SELECT da.id AS answer_id,
               u.date_of_birth,
               u.risk_score,
               u.first_name,
               u.last_name,
               da.risk_score_change,
               da.created_at,
               da.clinician_name,
               da.app_user_id
        FROM danger_alert da
        JOIN umass_id u ON da.app_user_id = u.app_user_id
        ORDER BY da.created_at DESC
    """
    rows = await conn.fetch(query)
    return [dict(r) for r in rows]


# danger-alert dates for heatmap compatibility
@router.get("/api/survey-timestamps/{user_id}")
async def fetch_dates_by_id(
    user_id: int,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    """
    Return a single user's danger alert timestamps by app_user_id.
    """
    sql = "SELECT created_at FROM danger_alert WHERE app_user_id = $1"

    try:
        result = await conn.fetch(sql, user_id)

        daily_counts = {}
        for row in result:
            ts = row["created_at"]

            # Convert to YYYY-MM-DD (using Python datetime)
            date_str = ts.strftime("%Y-%m-%d")

            # Add same-day events
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1

        # assemble dictionary for heatmap
        formatted = [{"date": date, "value": count} for date, count in daily_counts.items()]

        return formatted

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
