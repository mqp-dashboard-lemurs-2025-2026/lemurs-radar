import logging

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_db_connection

logger = logging.getLogger(__name__)
router = APIRouter()


# CCAP scores GET
@router.get("/ccap_scores/{id}")
async def read_ccap_scores(id: int, conn: asyncpg.Connection = Depends(get_db_connection)):
    query = """
    SELECT
        id,
        ccap_score,
        date
    FROM ccap_scores
    WHERE id = $1
    ORDER BY date ASC
    """

    logger.info(f"Executing query: {query} with id={id}")

    try:
        print(f"Executing query: {query} with id={id}")
        rows = await conn.fetch(query, id)

        if not rows:
            raise HTTPException(
                status_code=404,
                detail=f"No CCAP data found for id {id}",
            )

        return [dict(row) for row in rows]

    except Exception as e:
        print(f"Database Error (ccap_scores): {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/past_risk_scores/{id}")
async def read_risk_scores(id: int, conn: asyncpg.Connection = Depends(get_db_connection)):
    query = """
    SELECT
        id,
        risk_score,
        timestamp
    FROM past_risk_scores
    WHERE id = $1
    ORDER BY timestamp ASC
    """

    logger.info(f"Executing query: {query} with id={id}")

    try:
        print(f"Executing query: {query} with id={id}")
        rows = await conn.fetch(query, id)

        if not rows:
            raise HTTPException(
                status_code=404,
                detail=f"No Risk Score data found for id {id}",
            )

        return [dict(row) for row in rows]

    except Exception as e:
        print(f"Database Error (past_risk_scores): {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
