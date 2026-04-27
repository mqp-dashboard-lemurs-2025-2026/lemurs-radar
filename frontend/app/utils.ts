import { PastRiskScore } from "./types";

// Risk colors match the bands used by the backend filters.
export const getRiskColor = (riskScore: string): string => {
    const score = parseFloat(riskScore);
    if (score >= 0 && score <= 3) return "#90EE90";
    if (score > 3 && score <= 7) return "#FFCE1B";
    if (score > 7) return "#FF8080";
    return "#808080";
};

// Dashboard cards only show a short trend, not the full score history.
export const getLastThreeRiskScores = (scores: PastRiskScore[]) => {
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
