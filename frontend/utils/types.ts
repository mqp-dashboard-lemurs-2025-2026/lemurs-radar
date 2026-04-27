// Shared shapes for the individual student page.
// These fields come straight from the backend API responses.
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
    notes: string | null;
    risk_score_change: number;
    profile_picture: number;
    screentime_minutes?: number;
    steps?: number;
    sleep_minutes?: number;
    bluetooth_devices_count?: number;
    pronouns: string;
    ec_name: string;
    ec_phone: string;
    ec_relationship: string;
    next_seen: string;
    next_seen_iso?: string;
    last_appointment_time: string;
}

// Daily phone metrics shown in the student graphs.
export interface HealthMetric {
    app_user_id: number;
    date: string;
    screentime_minutes: number;
    steps: number;
    sleep_minutes: number;
    bluetooth_devices_count: number;
}

// Alert details shown in the student card.
export interface DangerAlertReason {
    question: string;
    answer: string;
    created_at: string;
    alert_message: string;
}

// Historical scores used by the charts on the student page.
export interface PastRiskScore {
    id: number;
    risk_score: string;
    timestamp: string;
}

export interface CcapScore {
    id: number;
    ccap_score: number;
    date: string;
}