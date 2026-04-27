// Shape returned by the dashboard student endpoints.
// Keep these names in sync with backend/app/routers/students.py.
export interface UserRecord {
    app_user_id: number;
    umass_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone_number: string;
    risk_score: string;
    clinician: string;
    started: string;
    latest_danger_alert: string;
    surveys_last_7d: string;
    risk_score_change: number;
    profile_picture: number;
    preferred_name: string;
    pronouns: string;
    ec_name: string;
    ec_phone: string;
    ec_relationship: string;
    next_seen?: string;
}

// Used by the small hover chart on the dashboard cards and rows.
export interface PastRiskScore {
    id: number;
    risk_score: string;
    timestamp: string;
}
