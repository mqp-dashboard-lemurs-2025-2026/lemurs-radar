-- Define Tables

CREATE TABLE umass_id (
    app_user_id INT PRIMARY KEY,
    umass_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    risk_score INT DEFAULT 0,
    risk_score_change INT DEFAULT 0,
    clinician VARCHAR(100),
    notes TEXT
);

CREATE TABLE progress (
    app_user_id INT PRIMARY KEY,
    started TIMESTAMP
);

CREATE TABLE survey_response (
    id SERIAL PRIMARY KEY,
    app_user_id INT,
    "timestamp" TIMESTAMP
);

CREATE TABLE answer (
    id SERIAL PRIMARY KEY,
    survey_response_id INT,
    question_text TEXT,
    answer_text TEXT
);

CREATE TABLE danger_alert (
    id SERIAL PRIMARY KEY,
    answer_id INT,
    created_at TIMESTAMP,
    alert_message TEXT,
    risk_score_change INT,
    alert_type VARCHAR(100),
    clinician_name VARCHAR(100) -- Snapshot of clinician at alert time
);

CREATE TABLE alert_settings (
    app_user_id INT PRIMARY KEY,
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(100), -- e.g. "Mon,Tue,Wed"
    CONSTRAINT fk_user_alert FOREIGN KEY(app_user_id) REFERENCES umass_id(app_user_id)
);

CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    app_user_id INT,
    date DATE,
    screentime_minutes INT,
    steps INT,
    sleep_minutes INT,
    bluetooth_devices_count INT,
    CONSTRAINT fk_user_metrics FOREIGN KEY(app_user_id) REFERENCES umass_id(app_user_id)
);

-- Define View for main.py compatibility and easier querying
CREATE VIEW all_danger_alert AS
SELECT
    da.created_at,
    da.alert_message,
    a.question_text AS question,
    a.answer_text AS answer,
    sr.app_user_id
FROM danger_alert da
JOIN answer a ON da.answer_id = a.id
JOIN survey_response sr ON a.survey_response_id = sr.id;

-- Seed Data

-- Users with Sketch details
INSERT INTO umass_id (app_user_id, umass_id, first_name, last_name, date_of_birth, email, phone_number, risk_score, risk_score_change, clinician, notes) VALUES
(1, '11111111', 'John', 'Doe', '2001-01-01', 'jdoe@wpi.edu', '123-456-7890', 3, -2, 'Dr. Jane', 'Patient requires daily monitoring.'),
(2, '22222222', 'Jane', 'Smith', '2002-02-02', 'jsmith@wpi.edu', '555-123-4567', 9, +2, 'Dr. Jane', NULL),
(3, '33333333', 'Alice', 'Johnson', '2000-05-15', 'ajohnson@wpi.edu', '555-987-6543', 7, +4, 'Dr. Bob', NULL),
(4, '44444444', 'Bob', 'Williams', '1999-12-12', 'bwilliams@wpi.edu', '555-555-5555', 6, +3, 'Dr. Jane', NULL),
(5, '55555555', 'Charlie', 'Brown', '2001-07-07', 'cbrown@wpi.edu', '555-111-2222', 5, 0, 'Dr. Bob', NULL),
(6, '66666666', 'David', 'Davis', '2002-08-08', 'ddavis@wpi.edu', '555-333-4444', 5, 0, 'Dr. Jane', NULL),
(7, '77777777', 'Eve', 'Evans', '2001-09-09', 'eevans@wpi.edu', '555-666-7777', 4, -2, 'Dr. Bob', NULL),
(8, '88888888', 'Frank', 'Foster', '2000-10-10', 'ffoster@wpi.edu', '555-888-9999', 4, 0, 'Dr. Jane', NULL),
(9, '99999999', 'Grace', 'Green', '2001-11-11', 'ggreen@wpi.edu', '555-000-1111', 3, 0, 'Dr. Bob', NULL),
(10, '10101010', 'Hank', 'Harris', '2002-01-20', 'hharris@wpi.edu', '555-222-3333', 2, 0, 'Dr. Jane', NULL);

-- Progress
INSERT INTO progress (app_user_id, started) VALUES
(1, '2025-01-10 10:00:00'),
(2, '2025-02-15 11:30:00'),
(3, '2025-03-20 12:00:00'),
(4, '2025-04-25 13:45:00'),
(5, '2025-05-01 09:00:00'),
(6, '2025-06-11 14:00:00'),
(7, '2025-07-22 16:00:00'),
(8, '2025-08-14 18:00:00'),
(9, '2025-09-03 20:00:00'),
(10, '2025-10-19 22:00:00');

-- Survey Responses
INSERT INTO survey_response (app_user_id, "timestamp") VALUES
-- User 1
(1, '2025-11-10 10:00:00'),
(1, '2025-11-11 11:00:00'),
(1, '2025-11-12 12:00:00'),
(1, '2025-11-13 13:00:00'),
(1, '2025-11-14 14:00:00'),
(1, '2025-11-15 15:00:00'),
(1, '2025-11-16 16:00:00'),
-- User 2
(2, '2025-11-10 10:00:00'),
(2, '2025-11-11 11:00:00'),
(2, '2025-11-12 12:00:00'),
-- User 3
(3, '2025-11-13 13:00:00'),
(3, '2025-11-14 14:00:00'),
-- User 4
(4, '2025-11-15 15:00:00'),
-- User 5
(5, '2025-11-16 16:00:00'),
-- User 6
(6, '2025-11-10 10:00:00'),
(6, '2025-11-11 11:00:00'),
(6, '2025-11-12 12:00:00'),
(6, '2025-11-13 13:00:00'),
-- User 7
(7, '2025-11-14 14:00:00'),
(7, '2025-11-15 15:00:00'),
-- User 8
(8, '2025-11-16 16:00:00'),
-- User 9
(9, '2025-11-10 10:00:00'),
-- User 10
(10, '2025-11-11 11:00:00');

-- Answers
-- Populating with dummy text
INSERT INTO answer (survey_response_id, question_text, answer_text) VALUES
(1, 'How are you feeling?', 'Good'), (2, 'How are you feeling?', 'Okay'), (3, 'How are you feeling?', 'Bad'), 
(4, 'How are you feeling?', 'Good'), (5, 'How are you feeling?', 'Good'), (6, 'How are you feeling?', 'Good'), 
(7, 'How are you feeling?', 'Good'), (8, 'How are you feeling?', 'Good'), (9, 'How are you feeling?', 'Good'), 
(10, 'How are you feeling?', 'Good'), (11, 'How are you feeling?', 'Good'), (12, 'How are you feeling?', 'Good'), 
(13, 'How are you feeling?', 'Good'), (14, 'How are you feeling?', 'Good'), (15, 'How are you feeling?', 'Good'), 
(16, 'How are you feeling?', 'Good'), (17, 'How are you feeling?', 'Good'), (18, 'How are you feeling?', 'Good'), 
(19, 'How are you feeling?', 'Good'), (20, 'How are you feeling?', 'Good'), (21, 'How are you feeling?', 'Good'), 
(22, 'How are you feeling?', 'Good'), (23, 'How are you feeling?', 'Good'), (24, 'How are you feeling?', 'Good');

-- Danger Alerts
INSERT INTO danger_alert (answer_id, created_at, alert_message, risk_score_change, alert_type, clinician_name) VALUES
(12, '2025-11-10 10:05:00', 'Elevated heart rate and low temperature', 4, 'Biometric', 'Dr. Jane'),
(8, '2025-11-11 11:05:00', 'Self isolation reported', 2, 'Self Isolation', 'Dr. Jane'),
(15, '2025-11-12 12:05:00', 'Low mood reported', 1, 'Mood', 'Dr. Bob'),
(13, '2025-11-13 13:05:00', 'Skipped medication', 3, 'Medication', 'Dr. Jane');

-- Alert Settings
INSERT INTO alert_settings (app_user_id, start_time, end_time, days_of_week) VALUES
(1, '09:00:00', '17:00:00', 'Mon,Tue,Wed,Thu,Fri'),
(2, '10:00:00', '18:00:00', 'Mon,Wed,Fri');

-- Health Metrics
INSERT INTO health_metrics (app_user_id, date, screentime_minutes, steps, sleep_minutes, bluetooth_devices_count)
SELECT 
    u.app_user_id,
    d::date,
    (FLOOR(RANDOM() * (480 - 120 + 1)) + 120)::INT,   -- 120 to 480 mins (2-8 hours)
    (FLOOR(RANDOM() * (15000 - 2000 + 1)) + 2000)::INT, -- 2000 to 15000 steps
    (FLOOR(RANDOM() * (540 - 300 + 1)) + 300)::INT,   -- 300 to 540 mins (5-9 hours)
    (FLOOR(RANDOM() * 20) + 1)::INT                     -- 1 to 20 devices
FROM umass_id u
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d;