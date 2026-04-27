import re
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_db_connection
from app.schemas.user_update import UserUpdate
from app.utils.display import process_record_for_display

router = APIRouter()


@router.get("/umass_id")
async def read_all_users(
    limit: int = 12,
    offset: int = 0,
    search_term: Optional[str] = None,
    search_mode: Optional[str] = "id",
    clinician: Optional[str] = None,
    risk_level: Optional[str] = None,
    active_alert: bool = False,
    appointment: Optional[str] = None,
    sort_by: str = "risk",
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    """Return the student table rows with the filters used by the dashboard."""
    # Keep this list close to the table columns the frontend expects.
    select_fields = """
    u.app_user_id,
    u.umass_id,
    u.first_name,
    u.last_name,
    u.prefered_name AS preferred_name,
    u.pronouns,
    u.date_of_birth,
    u.email,
    u.phone_number,
    u.risk_score,
    u.risk_score_change,
    u.clinician,
    u.last_appointment_time,
    u.next_seen,
    u.profile_picture,
    ec.ec_name,
    ec.ec_relationship,
    ec.ec_phone,
    MIN(p.started) AS started,
    MAX(da.created_at) AS latest_danger_alert,
    (
        SELECT COUNT(*)
        FROM danger_alert da2
        WHERE da2.app_user_id = u.app_user_id
          AND da2.created_at >= NOW() - INTERVAL '3 days'
    )::int AS surveys_last_3d
    """

    # Grab the first emergency contact so each student stays one row.
    from_clause = """
    FROM umass_id AS u
    LEFT JOIN (
        SELECT DISTINCT ON (app_user_id)
            app_user_id,
            first_name || ' ' || last_name AS ec_name,
            relationship AS ec_relationship,
            phone_number AS ec_phone
        FROM emergency_contacts
        ORDER BY app_user_id, id
    ) ec ON ec.app_user_id = u.app_user_id
    LEFT JOIN progress AS p ON u.app_user_id = p.app_user_id
    LEFT JOIN danger_alert AS da ON u.app_user_id = da.app_user_id
    """

    # These filter names come from the frontend controls.
    conditions = []
    values = []

    if search_term:
        st = search_term.strip()
        if search_mode == "id":
            conditions.append(f"(u.app_user_id::text = ${len(values)+1} OR u.umass_id ILIKE ${len(values)+2})")
            values.extend([st, f"%{st}%"])
        elif search_mode == "name":
            conditions.append(f"((u.first_name || ' ' || u.last_name) ILIKE ${len(values)+1})")
            values.append(f"%{st}%")
        elif search_mode == "preferredName":
            conditions.append(f"(COALESCE(u.prefered_name, '') ILIKE ${len(values)+1})")
            values.append(f"%{st}%")
        elif search_mode == "phone":
            digits = re.sub(r"\D", "", st)
            # Ignore phone formatting so searches can be typed loosely.
            conditions.append(f"(regexp_replace(u.phone_number, '\\D', '', 'g') LIKE ${len(values)+1})")
            values.append(f"%{digits}%")

    if clinician and clinician != "All":
        conditions.append(f"u.clinician = ${len(values)+1}")
        values.append(clinician)

    if risk_level and risk_level != "All":
        if risk_level.startswith("Low"):
            conditions.append("u.risk_score::numeric BETWEEN 0 AND 3")
        elif risk_level.startswith("Medium"):
            conditions.append("(u.risk_score::numeric > 3 AND u.risk_score::numeric <= 7)")
        elif risk_level.startswith("High"):
            conditions.append("u.risk_score::numeric > 7")

    if active_alert:
        conditions.append("EXISTS (SELECT 1 FROM danger_alert da3 WHERE da3.app_user_id = u.app_user_id)")

    if appointment and appointment != "All":
        if appointment == "Today":
            conditions.append("u.next_seen BETWEEN (NOW() - INTERVAL '1 day') AND (NOW() + INTERVAL '1 day')")
        elif appointment == "Yesterday":
            conditions.append("u.next_seen BETWEEN (NOW() - INTERVAL '2 days') AND NOW()")
        elif appointment == "Next 3 Days":
            conditions.append("u.next_seen BETWEEN (NOW() - INTERVAL '1 day') AND (NOW() + INTERVAL '3 days')")
        elif appointment == "Next 7 Days":
            conditions.append("u.next_seen BETWEEN (NOW() - INTERVAL '1 day') AND (NOW() + INTERVAL '7 days')")

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    group_by = " GROUP BY u.app_user_id, ec.ec_name, ec.ec_relationship, ec.ec_phone "

    order_by_clause = " ORDER BY u.risk_score::numeric DESC NULLS LAST"
    if sort_by == "firstName":
        order_by_clause = " ORDER BY u.first_name ASC NULLS LAST"
    elif sort_by == "lastName":
        order_by_clause = " ORDER BY u.last_name ASC NULLS LAST"
    elif sort_by == "preferredName":
        order_by_clause = " ORDER BY COALESCE(u.prefered_name, u.first_name) ASC NULLS LAST"
    elif sort_by == "appointment":
        order_by_clause = " ORDER BY u.next_seen ASC NULLS LAST"
    elif sort_by == "id":
        order_by_clause = " ORDER BY u.umass_id ASC NULLS LAST"

    # Add a stable tie breaker so pagination does not jump around.
    order_by_clause += ", u.app_user_id ASC"

    # Count and data queries use the same filters.
    count_query = f"SELECT COUNT(DISTINCT u.app_user_id) {from_clause} {where_clause}"

    fetch_query = f"SELECT {select_fields} {from_clause} {where_clause} {group_by} {order_by_clause} LIMIT ${len(values)+1} OFFSET ${len(values)+2}"
    fetch_values = values + [limit, offset]

    try:
        total_count = await conn.fetchval(count_query, *values)
        results = await conn.fetch(fetch_query, *fetch_values)
        data = [process_record_for_display(dict(record)) for record in results]
        return {"data": data, "total_count": total_count}
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/umass_id/{app_user_id}")
async def read_single_user(
    app_user_id: int,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    """Return all fields needed by the student detail page."""
    # Detail view uses the same first-contact rule as the table view.
    query = """
    SELECT
        u.app_user_id,
        u.umass_id,
        u.first_name,
        u.last_name,
        u.prefered_name AS preferred_name,
        u.pronouns,
        u.date_of_birth,
        u.email,
        u.phone_number,
        u.risk_score,
        u.risk_score_change,
        u.clinician,
        u.last_appointment_time,
        u.next_seen,
        u.notes,
        u.profile_picture,
        ec.ec_name,
        ec.ec_relationship,
        ec.ec_phone,
        MIN(p.started) AS started,
        (
            SELECT MAX(da.created_at)
            FROM danger_alert AS da
            WHERE da.app_user_id = u.app_user_id
        ) AS latest_danger_alert,
        (
            SELECT COUNT(*)
            FROM danger_alert da2
            WHERE da2.app_user_id = u.app_user_id
              AND da2.created_at >= NOW() - INTERVAL '7 days'
        )::int AS surveys_last_7d
    FROM umass_id AS u
    LEFT JOIN (
        SELECT DISTINCT ON (app_user_id)
            app_user_id,
            first_name || ' ' || last_name AS ec_name,
            relationship AS ec_relationship,
            phone_number AS ec_phone
        FROM emergency_contacts
        ORDER BY app_user_id, id
    ) ec ON ec.app_user_id = u.app_user_id
    LEFT JOIN progress AS p
        ON p.app_user_id = u.app_user_id
    WHERE u.app_user_id = $1
    GROUP BY u.app_user_id, ec.ec_name, ec.ec_relationship, ec.ec_phone
    """
    try:
        result = await conn.fetchrow(query, app_user_id)
        if result:
            return process_record_for_display(dict(result))
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# The public demo is read-only, so this update route stays disabled for now.
# Keep it here because it shows which fields were planned for editing.

# @router.put("/umass_id/{app_user_id}")
# async def update_user(
#     app_user_id: int,
#     update_data: UserUpdate,
#     conn: asyncpg.Connection = Depends(get_db_connection)
# ):
#     updates = []
#     values = []
#
#     if update_data.clinician is not None:
#         updates.append(f"clinician = ${len(values) + 1}")
#         values.append(update_data.clinician)
#
#     if update_data.next_seen is not None:
#         # Next.js passes naive datetime string representing user local time (EST/EDT)
#         # Convert it to UTC naive datetime so it matches the DB expectation
#         try:
#             from zoneinfo import ZoneInfo
#             local_dt = update_data.next_seen.replace(tzinfo=ZoneInfo("America/New_York"))
#             utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
#             utc_naive = utc_dt.replace(tzinfo=None)
#             updates.append(f"next_seen = ${len(values) + 1}")
#             values.append(utc_naive)
#         except ImportError:
#             updates.append(f"next_seen = ${len(values) + 1}")
#             values.append(update_data.next_seen)
#
#     if update_data.notes is not None:
#         updates.append(f"notes = ${len(values) + 1}")
#         values.append(update_data.notes)
#
#     if not updates:
#         return {"status": "no updates provided"}
#
#     values.append(app_user_id)
#     query = f"UPDATE umass_id SET {', '.join(updates)} WHERE app_user_id = ${len(values)}"
#
#     try:
#         await conn.execute(query, *values)
#         return {"status": "success"}
#     except Exception as e:
#         print(f"Database Error: {e}")
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
