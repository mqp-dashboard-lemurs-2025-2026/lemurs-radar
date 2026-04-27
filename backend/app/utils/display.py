from datetime import date, datetime
from typing import Any, Dict, List

try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo


def process_record_for_display(record):
    """Convert UTC datetimes to EST and format counts nicely."""
    # Convert datetime fields
    if record.get("started") and isinstance(record["started"], datetime):
        utc_time = record["started"].replace(tzinfo=ZoneInfo("UTC"))
        est_time = utc_time.astimezone(ZoneInfo("America/New_York"))
        record["started"] = est_time.strftime("%m-%d-%Y, %I:%M %p %Z").lstrip("0")
    else:
        # If started is None or not a datetime, ensure it's handled gracefully
        # (Original code set it to "None" string if missing/invalid)
        if "started" in record and record["started"] is None:
            record["started"] = "None"

    if record.get("latest_danger_alert") and isinstance(record["latest_danger_alert"], datetime):
        utc_time = record["latest_danger_alert"].replace(tzinfo=ZoneInfo("UTC"))
        est_time = utc_time.astimezone(ZoneInfo("America/New_York"))
        record["latest_danger_alert"] = est_time.strftime("%m-%d-%Y, %I:%M %p %Z").lstrip("0")
    elif record.get("latest_danger_alert") is None:
        record["latest_danger_alert"] = "None"

    if record.get("last_appointment_time") and isinstance(record["last_appointment_time"], datetime):
        utc_time = record["last_appointment_time"].replace(tzinfo=ZoneInfo("UTC"))
        est_time = utc_time.astimezone(ZoneInfo("America/New_York"))
        record["last_appointment_time"] = est_time.strftime("%m-%d-%Y, %I:%M %p %Z").lstrip("0")
    elif record.get("last_appointment_time") is None:
        record["last_appointment_time"] = "None"

    if record.get("next_seen") and isinstance(record["next_seen"], datetime):
        utc_time = record["next_seen"].replace(tzinfo=ZoneInfo("UTC"))
        est_time = utc_time.astimezone(ZoneInfo("America/New_York"))
        record["next_seen_iso"] = est_time.strftime("%Y-%m-%dT%H:%M")
        record["next_seen"] = est_time.strftime("%m-%d-%Y, %I:%M %p %Z").lstrip("0")
    elif record.get("next_seen") is None:
        record["next_seen"] = "None"
        record["next_seen_iso"] = ""

    # Format date_of_birth if present
    if record.get("date_of_birth") and isinstance(record["date_of_birth"], date):
        record["date_of_birth"] = record["date_of_birth"].strftime("%m/%d/%Y")

    # Format surveys count as "x/7"
    if "surveys_last_3d" in record and record["surveys_last_3d"] is not None:
        record["surveys_last_3d"] = f"{int(record['surveys_last_3d'])}/7"
    elif "surveys_last_3d" in record:
        record["surveys_last_3d"] = "None"

    if "surveys_last_7d" in record and record["surveys_last_7d"] is not None:
        # Assuming denominator is 7 for last 7 days too? Or just show count?
        # Sketch 1 just shows a number like "06" in the box. Sketch 3 shows nothing about survey count.
        # But the code puts it in the record. I'll leave it as int or formatted string.
        # Original code logic for `surveys_last_3d` was `x/7`.
        pass

    return record


def process_danger_for_display(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format created_at timestamps in EST."""
    for r in rows:
        # --- format created_at like other datetime fields ---
        if r.get("created_at") and isinstance(r["created_at"], datetime):
            utc_time = r["created_at"].replace(tzinfo=ZoneInfo("UTC"))
            est_time = utc_time.astimezone(ZoneInfo("America/New_York"))
            r["created_at"] = est_time.strftime("%m-%d-%Y, %I:%M %p %Z").lstrip("0")

    return rows
