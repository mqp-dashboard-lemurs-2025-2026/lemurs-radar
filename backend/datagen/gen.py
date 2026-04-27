import argparse
import random
from datetime import date, datetime, timedelta, time

from faker import Faker

fake = Faker()

# Automatically format data going into intsert statements
def sql_quote(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return str(v)
    if isinstance(v, date):
        return f"'{v.isoformat()}'"
    if isinstance(v, datetime):
        return f"'{v.strftime('%Y-%m-%d %H:%M:%S')}'"
    if isinstance(v, time):
        return f"'{v.strftime('%H:%M:%S')}'"
    s = str(v).replace("'", "''")
    return f"'{s}'"

# Insert rows into a specific table
def insert(fp, table, columns, rows):
    if not rows:
        return
    fp.write(f"INSERT INTO {table} ({', '.join(columns)}) VALUES\n")
    fp.write(",\n".join("  (" + ", ".join(sql_quote(v) for v in row) + ")" for row in rows))
    fp.write(";\n\n")


# Pre-define the tables from old schema
# Make sure to update this when adding new columns
SCHEMA_SQL = """-- Define Tables

CREATE TABLE umass_id (
    app_user_id INT PRIMARY KEY,
    umass_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    prefered_name VARCHAR(100),
    pronouns VARCHAR(50),
    date_of_birth DATE,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    risk_score INT DEFAULT 0,
    risk_score_change INT DEFAULT 0,
    clinician VARCHAR(100),
    last_appointment_time TIMESTAMP,
    next_seen TIMESTAMP,
    notes TEXT,
    profile_picture INT
);

CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    app_user_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    relationship VARCHAR(50),
    phone_number VARCHAR(20)
);

CREATE TABLE progress (
    app_user_id INT PRIMARY KEY,
    started TIMESTAMP
);

CREATE TABLE danger_alert (
    id SERIAL PRIMARY KEY,
    app_user_id INT,
    created_at TIMESTAMP,
    alert_message TEXT,
    risk_score_change INT,
    alert_type VARCHAR(100),
    clinician_name VARCHAR(100), -- Snapshot of clinician at alert time
    CONSTRAINT fk_user_alerts FOREIGN KEY(app_user_id) REFERENCES umass_id(app_user_id)
);

CREATE TABLE alert_settings (
    app_user_id INT PRIMARY KEY,
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(100), -- e.g. "Mon,Tue,Wed"
    CONSTRAINT fk_user_alert FOREIGN KEY(app_user_id) REFERENCES umass_id(app_user_id)
);

CREATE TABLE health_metrics (
    app_user_id INT,
    date DATE,
    screentime_minutes INT,
    steps INT,
    sleep_minutes INT,
    bluetooth_devices_count INT,
    CONSTRAINT fk_user_metrics FOREIGN KEY(app_user_id) REFERENCES umass_id(app_user_id)
);

CREATE TABLE past_risk_scores (
    id INT,
    risk_score INT,
    timestamp TIMESTAMP
);

CREATE TABLE ccap_scores (
    id INT,
    ccap_score INT,
    date TIMESTAMP
);

-- Define View for main.py compatibility and easier querying
CREATE VIEW all_danger_alert AS
SELECT
    da.created_at,
    da.alert_message,
    NULL::TEXT AS question,
    NULL::TEXT AS answer,
    da.app_user_id
FROM danger_alert da;
"""

# Default values
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

QUESTIONS = [
    ("How are you feeling?", ["Great", "Good", "Okay", "Bad", "Terrible"]),
    ("How many hours did you sleep?", ["<4", "4-5", "6-7", "8+", "Could not sleep"]),
    ("Have you felt isolated today?", ["No", "A little", "Yes", "Very", "I avoided everyone"]),
    ("Any thoughts of self-harm?", ["No", "Intrusive thoughts", "Yes (passive)", "Yes (active)", "Prefer not to say"]),
    ("Did you take your medication?", ["Yes", "No", "Not prescribed", "Forgot", "Stopped"]),
]

# Helper to pick a day of the week
def pick_day():
    k = random.randint(2, 5)
    return ",".join(random.sample(DAYS[:5] if random.random() < 0.8 else DAYS, k))

def get_random_appointment_time(base_dt, days_offset):
    target = base_dt + timedelta(days=days_offset)
    # Skip weekends
    if target.weekday() == 5:
        target += timedelta(days=2)
    elif target.weekday() == 6:
        # If it's Sunday and we were going backwards, maybe shift backwards,
        # but adding 1 day to make it Monday is fine.
        target += timedelta(days=1)
        
    hour = random.randint(9, 16) # 9 AM through 4 PM
    minute = random.choice([0, 15, 30, 45])
    return target.replace(hour=hour, minute=minute, second=0, microsecond=0)


# Generates students with random information from Faker
def gen_users(n_users, clinicians):
    rows = []
    profile_pictures_used = []
    now = datetime.now()
    for app_user_id in range(1, n_users + 1):
        first = fake.first_name()
        last = fake.last_name()
        preferred_name = fake.first_name() if random.random() < 0.1 else None
        pronouns = random.choice(["He/Him", "She/Her", "They/Them", "Other"])
        dob = fake.date_of_birth(minimum_age=18, maximum_age=26)

        # Generate a random 8-digit umass ID
        umass = "".join(str(random.randint(0, 9)) for _ in range(8))

        email = f"{first[0].lower()}{last.lower()}{random.randint(1, 999)}@wpi.edu"
        phone = fake.numerify("###-###-####")

        # Generate a risk score with a bias towards lower values
        risk_score = max(1, min(10, round(random.gauss(3, 3))))
        risk_score_change = random.choice([-2, -1, 0, 1, 2, 3])

        # Randomly assign a clinician to some students
        clinician = random.choice(clinicians)
        last_appointment_time = get_random_appointment_time(now, -random.randint(0, 6))
        next_seen = get_random_appointment_time(last_appointment_time, 7)
        notes = None
        if random.random() < 0.2:
            notes = random.choice([
                "Patient requires daily monitoring.",
                "Check-in recommended twice weekly.",
                "Follow up after next appointment.",
                "History of missed sleep goals.",
            ])

        profile_picture = random.randint(1, 1363)
        while profile_picture in profile_pictures_used and len(profile_pictures_used) < 1363:
            profile_picture = random.randint(1, 1363)
        profile_pictures_used.append(profile_picture)

        rows.append((
            app_user_id, umass, first, last, preferred_name, pronouns, dob, email, phone,
            risk_score, risk_score_change, clinician, last_appointment_time, next_seen, notes, profile_picture
        ))
    return rows


def gen_emergency_contacts(n_users):
    rows = []
    relationships = ["Parent", "Sibling", "Friend", "Partner", "Other"]
    for app_user_id in range(1, n_users + 1):
        for _ in range(random.randint(1, 3)):
            first = fake.first_name()
            last = fake.last_name()
            relationship = random.choice(relationships)
            phone = fake.numerify("###-###-####")
            rows.append((app_user_id, first, last, relationship, phone))
    return rows

# Generates progress rows with random start dates within the last year
def gen_progress(n_users):
    today = datetime.today().date()
    rows = []

    for app_user_id in range(1, n_users + 1):
        started_date = today - timedelta(days=random.randint(0, 365))
        rows.append((app_user_id, started_date))

    return rows

# Generates random alert settings for some users, with random times and days of the week
def gen_alert_settings(n_users):
    rows = []
    for app_user_id in range(1, n_users + 1):
        if random.random() < 0.1:
            start_h = random.choice([8, 9, 10, 11])
            end_h = random.choice([16, 17, 18, 19])
            rows.append((
                app_user_id,
                time(start_h, 0, 0),
                time(end_h, 0, 0),
                pick_day()
            ))
    return rows

# Generates health metrics for each user for a range of dates, with random values for screentime, steps, sleep, and bluetooth devices
def gen_health_metrics(n_users, days_back, days_count):
    base = date.today() - timedelta(days=days_back)
    dates = [base + timedelta(days=i) for i in range(days_count)]

    rows = []
    for app_user_id in range(1, n_users + 1):
        for d in dates:
            screentime = random.randint(120, 480)            
            steps = random.randint(2000, 15000)
            sleep = random.randint(180, 720)                 
            bluetooth = random.randint(1, 20)
            rows.append((app_user_id, d, screentime, steps, sleep, bluetooth))
    return rows

def gen_danger_alerts(users, max_alerts_per_user, clinicians, window_days):
    now = datetime.now()
    alert_rows = []
    next_alert_id = 1

    for user in users:
        app_user_id = user[0]
        risk_score = user[9]
        risk_score_change = user[10]

        if risk_score > 8 and risk_score_change > 0:
            clinician_name = random.choice(clinicians)
            n_alerts = random.randint(1, max_alerts_per_user)

            for _ in range(n_alerts):
                q, options = random.choice(QUESTIONS)
                
                # Make sure the answer reflects a high risk scenario
                high_risk_answers = {
                    "How are you feeling?": ["Bad", "Terrible"],
                    "How many hours did you sleep?": ["<4", "Could not sleep"],
                    "Have you felt isolated today?": ["Yes", "Very", "I avoided everyone"],
                    "Any thoughts of self-harm?": ["Intrusive thoughts", "Yes (passive)", "Yes (active)"],
                    "Did you take your medication?": ["No", "Stopped"]
                }
                a = random.choice(high_risk_answers.get(q, options))

                alert_type = (
                    "Self Harm" if q == "Any thoughts of self-harm?" and a != "No" else
                    "Mood" if q == "How are you feeling?" and a in ["Bad", "Terrible"] else
                    "Self Isolation" if q == "Have you felt isolated today?" and a in ["Yes", "Very", "I avoided everyone"] else
                    "Medication" if q == "Did you take your medication?" and a in ["No", "Stopped"] else
                    "Check-In"
                )
                msg = {
                    "Self Harm": "Self-harm risk detected",
                    "Mood": "Low mood detected",
                    "Self Isolation": "Self isolation detected",
                    "Medication": "Medication non-adherence detected",
                    "Check-In": "Concerning check-in detected",
                }[alert_type]

                created_at = now - timedelta(
                    days=random.randint(0, max(1, window_days)),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                )
                risk_change = random.randint(1, 5)

                alert_rows.append((
                    next_alert_id,
                    app_user_id,
                    created_at,
                    msg,
                    risk_change,
                    alert_type,
                    clinician_name,
                ))
                next_alert_id += 1

    alert_rows.sort(key=lambda r: r[2])
    return alert_rows

def gen_past_risk_scores(n_users, days_count, users):
    rows = []
    for app_user_id in range(1, n_users + 1):
        for i in range(days_count, 0, -1):
            ts = datetime.now() - timedelta(days=days_count - i)
            if i == days_count:
                risk_score = users[app_user_id - 1][9]
            elif i == days_count - 1:
                risk_score = max(1, min(10, risk_score - users[app_user_id - 1][10]))
            elif random.random() > 0.7:
                risk_score = max(1, min(10, risk_score + random.randint(-2, 2)))
            rows.append((app_user_id, risk_score, ts))
    return rows

def gen_past_ccap_scores(n_users, days_count):
    rows = []
    for app_user_id in range(1, n_users + 1):
        for i in range(days_count, 0, -1):
            ts = datetime.now() - timedelta(weeks=days_count - i)
            if i == days_count:
                ccaps_score = max(1, min(248, round(random.gauss(80, 40))))
            elif random.random() > 0.7: 
                ccaps_score = max(0, min(248, ccaps_score + random.randint(-30, 30)))
            rows.append((app_user_id, ccaps_score, ts))
    return rows


def main():
    # Command line arguments for configuration
    parser = argparse.ArgumentParser(description="Create spoof data in the form of SQL file for initializing the database.")
    parser.add_argument("--out", default="init.generated.sql", help="Output file name")
    parser.add_argument("--seed", type=int, default=random.randint(100000,999999), help="Seed for random generation")
    parser.add_argument("--users", type=int, default=100, help="Number of users (umass_id rows)")
    parser.add_argument("--max-alerts-per-user", type=int, default=3, help="Danger alerts per user")
    parser.add_argument("--danger-alert-rate", type=float, default=0.05, help="Rate of high risk students")
    parser.add_argument("--health-days", type=int, default=7, help="How many days of health metrics to generate")
    parser.add_argument("--health-days-back", type=int, default=6, help="How many days back from today to start metrics")
    parser.add_argument("--alerts-window-days", type=int, default=14, help="How old the alerts can be (in days)")

    parser.add_argument("--clinicians", default="Dr. Jane,Dr. Bob", help="Comma-separated clinician names")
    parser.add_argument("--include-schema", action="store_true", default=True, help="Include CREATE TABLE/VIEW in output")
    parser.add_argument("--truncate", action="store_true", default=True, help="Include TRUNCATE ... RESTART IDENTITY CASCADE")

    args = parser.parse_args()

    # Set random seed for reproducibility
    random.seed(args.seed)
    Faker.seed(args.seed)

    # Parse clinicians from command line
    clinicians = [c.strip() for c in args.clinicians.split(",") if c.strip()]

    # Generate rows
    users = gen_users(args.users, clinicians)
    emergency_contacts = gen_emergency_contacts(args.users)
    progress = gen_progress(args.users)
    alert_settings = gen_alert_settings(args.users)
    health_metrics = gen_health_metrics(args.users, args.health_days_back, args.health_days)
    danger_alerts = gen_danger_alerts(
        users=users,
        max_alerts_per_user=args.max_alerts_per_user,
        clinicians=clinicians,
        window_days=args.alerts_window_days,
    )
    past_risk_scores = gen_past_risk_scores(args.users, args.health_days, users)
    past_ccap_score = gen_past_ccap_scores(args.users, args.health_days)

    # Write to output SQL file
    with open(args.out, "w", encoding="utf-8") as fp:
        fp.write("-- Auto-generated init SQL for LEMURS RADAR schema\n")
        fp.write(f"-- Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        fp.write(f"-- Configuration: seed={args.seed}\n\n")

        if args.include_schema:
            fp.write(SCHEMA_SQL)
            fp.write("\n\n")

        if args.truncate:
            fp.write("-- Reset tables (order matters)\n")
            fp.write("TRUNCATE TABLE danger_alert RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE past_risk_scores RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE health_metrics RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE alert_settings RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE progress RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE emergency_contacts RESTART IDENTITY CASCADE;\n")
            fp.write("TRUNCATE TABLE umass_id RESTART IDENTITY CASCADE;\n\n")

        # umass_id
        insert(
            fp,
            "umass_id",
            ["app_user_id", "umass_id", "first_name", "last_name", "prefered_name", "pronouns", "date_of_birth", "email",
             "phone_number", "risk_score", "risk_score_change", "clinician", "last_appointment_time", "next_seen", "notes", "profile_picture"],
            users
        )
        
        insert(
            fp,"emergency_contacts",
            ["app_user_id", "first_name", "last_name", "relationship", "phone_number"],
            emergency_contacts)

        # progress
        insert(fp, "progress", ["app_user_id", "started"], progress)

        # danger_alert
        insert(
            fp,
            "danger_alert",
            ["id", "app_user_id", "created_at", "alert_message", "risk_score_change", "alert_type", "clinician_name"],
            danger_alerts
        )

        # alert_settings
        insert(fp, "alert_settings", ["app_user_id", "start_time", "end_time", "days_of_week"], alert_settings)

        # health_metrics
        insert(
            fp,
            "health_metrics",
            ["app_user_id", "date", "screentime_minutes", "steps", "sleep_minutes", "bluetooth_devices_count"],
            health_metrics
        )
        
        insert(
            fp,
            "past_risk_scores",
            ["id", "risk_score", "timestamp"],
            past_risk_scores
        )

        insert(
            fp,
            "ccap_scores",
            ["id", "ccap_score", "date"],
            past_ccap_score
        )

        fp.write("-- Done.\n")

    # Print summary
    print(f"Wrote {args.out}")
    print(f"Random seed: {args.seed}")
    print(f"Users: {args.users}")
    print(f"Danger alerts: {len(danger_alerts)}")
    print(f"Alert settings: {len(alert_settings)}")
    print(f"Health metrics rows: {len(health_metrics)}")
    print(f"Past risk scores: {len(past_risk_scores)}")


if __name__ == "__main__":
    main()
