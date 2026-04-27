"use client";

import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Tooltip
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LemursHeader from "../../components/header";

// used for alert score bar chart
import {
    Line,
    LineChart,
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceArea,
    Tooltip as RechartsTooltip,
} from "recharts";

interface AlertRecord {
    answer_id: number;
    app_user_id: number;
    date_of_birth: string;
    risk_score: number;
    risk_score_change: number;
    created_at: string;
    clinician_name: string;
    first_name: string;
    last_name: string;
}

export default function AlertsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tableData, setTableData] = useState<AlertRecord[]>([]);

    const fetchData = async () => {
        // Pull the same alert list used by the header badge.
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/danger_alert");

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const formatted = Array.isArray(data) ? data : [data];

            setTableData(formatted);

        } catch (err: any) {
            setError(err.message);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAlerts = async () => {
        // Placeholder for a future write endpoint. The current demo keeps alerts read-only.
    };

// Small hover chart for the risk change column.
const RiskHoverChart = ({
    data,
}: {
    data: { date: string; risk_score: number }[];
}) => {
    return (
        <Box sx={{ width: 250,  display: "flex", flexDirection: "column", alignItems: "center"}}>
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    mb: 0.5
                }}
            >
                Risk Score History
            </Typography>

            <Box sx={{ width: "100%", height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 5, bottom: 5, left: -40 }}
                >
                    <ReferenceArea y1={0} y2={4} fill="#90EE90" />
                    <ReferenceArea y1={4} y2={7} fill="#FFCE1B" />
                    <ReferenceArea y1={7} y2={10} fill="#FF8080" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} 
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            const month = String(date.getMonth() +1).padStart(2,"0");
                            const day = String(date.getDate()).padStart(2,"0");
                            return `${month}/${day}`;
                        }} />
                    <YAxis dataKey="risk_score" tick={{ fontSize: 10 }} ticks={[0,2,4,6,8,10]} range={[0, 10.5]}/>
                    <RechartsTooltip />
                    <Line
                        dataKey="risk_score"
                        stroke="#1976d2"
                        strokeWidth={4}
                        dot={{ r: 3, fill: "#1976d2" }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
        </Box>
    );
};

interface PastRiskScore {
    id: number;
    risk_score: string;
    timestamp: string;
}

// Keep only the latest three scores so the tooltip stays readable.
    const getLastThreeRiskScores = (scores: PastRiskScore[]) => {
        if (!scores || scores.length === 0) return [];

        return scores
            .map((r) => ({
                dateObj: new Date(r.timestamp),
                date: new Date(r.timestamp).toLocaleDateString(),
                risk_score: Number(r.risk_score),
            }))
            .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()) // newest first
            .slice(0, 3) // take most recent 3
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // re-sort oldest → newest
    };


    const fetchPastRiskScores = async (id: number) => {
        // Load history only when the user hovers a score change.
        try {
            const response = await fetch(`/past_risk_scores/${id}`);
            if (!response.ok) return;

            const data = await response.json();

            setHoverRiskData((prev) => ({
                ...prev,
                [id]: data || [],
            }));
        } catch (err) {
            console.error("Failed to fetch Past Risk Scores", err);
        }
    };

    const [hoverRiskData, setHoverRiskData] = useState<{
        [userId: number]: PastRiskScore[];
    }>({});

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, "0");

        return `${month}/${day}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    };



    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
        <LemursHeader/>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

    {/* Top Buttons */}
    <Box display="flex" alignItems="center" gap={2}>
        <Button variant="outlined" onClick={() => router.back()}>
            ← Back to Dashboard
        </Button>

        <Button variant="outlined" onClick={handleClearAlerts}>
            Clear Alerts
        </Button>
    </Box>

    {/* Empty State */}
    {tableData.length === 0 && (
        <Typography
            sx={{
                mt: 4,
                fontSize: "20px",
                textAlign: "center",
                opacity: 0.7,
            }}
        >
            No alerts to show
        </Typography>
    )}

    {tableData.length > 0 && (
        <Box sx={{ overflowX: "auto", mt: 3 }}>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: "#f8f8f8" }}>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                            Name
                        </th>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                            Risk Score
                        </th>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                            Score Change
                        </th>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                            Date of Alert
                        </th>
                        <th style={{ textAlign: "left", padding: "8px" }}>
                            Clinician
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {tableData.map((row) => (
                        <tr
                            key={row.answer_id + row.created_at}
                            onClick={() =>
                                row.app_user_id &&
                                router.push(`/student_id/${row.app_user_id}`)
                            }
                            role="button"
                            tabIndex={0}
                            style={{
                                cursor: row.app_user_id
                                    ? "pointer"
                                    : "default",
                                border: "4px solid #FF8080",
                            }}
                        >
                            <td style={{ padding: "8px", fontWeight: "bold" }}>
                                {row.first_name} {row.last_name}
                            </td>

                            <td style={{ padding: "8px" }}>
                                {row.risk_score}
                            </td>

                            <td style={{ padding: "8px" }}>
                                <Tooltip
                                    arrow
                                    placement="right"
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor: "white",
                                                color: "black",
                                                boxShadow: 3,
                                                p: 1,
                                            },
                                        },
                                    }}
                                    title={
                                        <RiskHoverChart
                                            data={getLastThreeRiskScores(
                                                hoverRiskData[row.app_user_id] || []
                                            )}
                                        />
                                    }
                                >
                                    <span
                                        onMouseEnter={() => {
                                            if (!hoverRiskData[row.app_user_id]) {
                                                fetchPastRiskScores(row.app_user_id);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ cursor: "pointer", fontWeight: 500 }}
                                    >
                                {row.risk_score_change > 0
                                    ? "+" + row.risk_score_change
                                    : row.risk_score_change}
                                    </span>
                                    </Tooltip>
                            </td>

                            <td style={{ padding: "8px" }}>
                                {formatDate(row.created_at)}
                            </td>

                            <td style={{ padding: "8px" }}>
                                {row.clinician_name}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    )}
</Box>
</>
    );
}
