"use client";

import React from "react";
import { Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { UserRecord, PastRiskScore } from "../app/types";
import { getRiskColor, getLastThreeRiskScores } from "../app/utils";
import RiskHoverChart from "./RiskHoverChart";

interface StudentListRowProps {
    row: UserRecord;
    dangerUserIds: number[];
    hoverRiskData: { [userId: number]: PastRiskScore[] };
    fetchPastRiskScores: (id: number) => void;
}

export default function StudentListRow({ row, dangerUserIds, hoverRiskData, fetchPastRiskScores }: StudentListRowProps) {
    const router = useRouter();

    // List rows mirror the card behavior
    return (
        <tr
            onClick={() => router.push(`/student_id/${row.app_user_id}`)}
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/student_id/${row.app_user_id}`)}
            role="button"
            tabIndex={0}
            style={{
                cursor: 'pointer',
                border: `4px solid ${getRiskColor(row.risk_score)}`,
            }}
        >
            <td style={{ padding: "8px" }}>
                {row.first_name} {row.last_name}
                {dangerUserIds.includes(row.app_user_id) && (
                    <Tooltip title="Recent Risk Alert">
                        <img src="/exclamation-mark-icon.png" alt="Risk alert" style={{ width: 16, height: 16, marginRight: 8 }} />
                    </Tooltip>
                )}

            </td>
            <td style={{ padding: "8px" }}>{row.phone_number}</td>
            <td style={{ padding: "8px" }}>{row.ec_phone}</td>
            <td style={{ padding: "8px" }}> {/* risk score row */}
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
                                // Load chart data only when someone hovers the score.
                                fetchPastRiskScores(row.app_user_id);
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer", fontWeight: 500 }}
                    >
                        {row.risk_score}
                    </span>
                </Tooltip>

                {/* risk score icons */}
                {((row.risk_score_change ?? 0) > 0) && (
                    <Tooltip title={`Risk increased by ${row.risk_score_change} since yesterday`}>
                        <Typography component="span" sx={{ color: '#E53935', fontWeight: 900, fontSize: '1.5rem', paddingLeft: 1, verticalAlign: 'middle', display: 'inline-block', lineHeight: 1, transform: 'rotate(-45deg)' }}>
                            ➔
                        </Typography>
                    </Tooltip>
                )}
                {((row.risk_score_change ?? 0) < 0) && (
                    <Tooltip title={`Risk decreased by ${Math.abs(row.risk_score_change)} since yesterday`}>
                        <Typography component="span" sx={{ color: '#43A047', fontWeight: 900, fontSize: '1.5rem', paddingLeft: 1, verticalAlign: 'middle', display: 'inline-block', lineHeight: 1, transform: 'rotate(45deg)' }}>
                            ➔
                        </Typography>
                    </Tooltip>
                )}
                {((row.risk_score_change ?? 0) === 0) && (
                    <Tooltip title="No change in risk score">
                        <Typography component="span" sx={{ color: '#888', fontWeight: 900, fontSize: '1.5rem', paddingLeft: 1, verticalAlign: 'middle', display: 'inline-block', lineHeight: 1 }}>
                            ➔
                        </Typography>
                    </Tooltip>
                )}
            </td>
            <td style={{ padding: "8px" }}>{row.clinician}</td>
        </tr>
    );
}
