"use client";

import React from "react";
import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { UserRecord, PastRiskScore } from "../app/types";
import { getRiskColor, getLastThreeRiskScores } from "../app/utils";
import RiskHoverChart from "./RiskHoverChart";

interface StudentCardProps {
    row: UserRecord;
    dangerUserIds: number[];
    hoverRiskData: { [userId: number]: PastRiskScore[] };
    fetchPastRiskScores: (id: number) => void;
}

export default function StudentCard({ row, dangerUserIds, hoverRiskData, fetchPastRiskScores }: StudentCardProps) {
    const router = useRouter();

    // The whole card opens the student profile, except the score tooltip.
    return (
        <Card
            onClick={() => router.push(`/student_id/${row.app_user_id}`)}
            role="button"
            tabIndex={0}
            sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: 4,
                height: 170,
                width: "100%",
                maxWidth: 600,
                boxShadow: 3,
                p: 0,
                border: `6px solid ${getRiskColor(row.risk_score)}`,
                "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                transition: "0.2s",
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', "&:last-child": { pb: 1.5 } }}>
                {/* Top Row: Photo & Name */}
                <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                    {/* Photo */}
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid #ccc",
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={"/profile-pictures/" + row.profile_picture + ".jpg" || "/default-profile.png"}
                            alt="Profile"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                // Some generated records may point at a missing mock photo.
                                (e.currentTarget as HTMLImageElement).src = "/default-profile.png";
                            }}
                        />
                    </Box>

                    {/* Name Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {row.first_name} {row.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {row.preferred_name} ({row.pronouns})
                        </Typography>
                    </Box>
                </Box>

                {/* Danger Icon - Absolute Top Right */}
                {dangerUserIds.includes(row.app_user_id) && (
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <Tooltip title="Recent Risk Alert">
                            <img src="/exclamation-mark-icon.png" alt="Risk alert" style={{ width: 28, height: 28 }} />
                        </Tooltip>
                    </Box>
                )}

                {/* Spacer to push bottom section down */}
                <Box sx={{ flex: 1 }} />

                {/* Bottom Section: Details + Risk Score Box in a Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                    {/* Details Section */}
                    <Box sx={{ overflow: 'hidden', mr: 1, alignSelf: 'center' }}>
                        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                            ID: {row.umass_id}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                            PH: {row.phone_number}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
                                {"EC: "}
                            </Typography>
                            <Tooltip title={`Emergency Contact: ${row.ec_name} (${row.ec_relationship})`} arrow>
                                <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', cursor: 'help' }}>
                                    {row.ec_phone}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Risk Score Box */}
                    <Box
                        sx={{
                            width: 75,
                            height: 75,
                            borderRadius: 3,
                            bgcolor: "#e0e0e0",
                            border: `4px solid ${getRiskColor(row.risk_score)}`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            flexShrink: 0, // Prevent shrinking
                            position: 'relative'
                        }}
                    >
                        <Typography variant="caption" sx={{ position: 'absolute', top: 4, width: 75, textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: '#555' }}>
                            Risk Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5, gap: 1 }}>
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
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700, cursor: "pointer" }}
                                    onMouseEnter={() => {
                                        if (!hoverRiskData[row.app_user_id]) {
                                            // Load chart data only when someone asks to see it.
                                            fetchPastRiskScores(row.app_user_id);
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {row.risk_score}
                                </Typography>
                            </Tooltip>

                            {((row.risk_score_change ?? 0) > 0) && (
                                <Tooltip title={`Risk increased by ${row.risk_score_change} since yesterday`}>
                                    <Typography sx={{ color: '#E53935', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, pb: 0.5, transform: 'rotate(-45deg)' }}>
                                        ➔
                                    </Typography>
                                </Tooltip>
                            )}
                            {((row.risk_score_change ?? 0) < 0) && (
                                <Tooltip title={`Risk decreased by ${Math.abs(row.risk_score_change)} since yesterday`}>
                                    <Typography sx={{ color: '#43A047', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, pb: 0.5, transform: 'rotate(45deg)' }}>
                                        ➔
                                    </Typography>
                                </Tooltip>
                            )}
                            {((row.risk_score_change ?? 0) === 0) && (
                                <Tooltip title="No change in risk score">
                                    <Typography sx={{ color: '#888', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, pb: 0.5 }}>
                                        ➔
                                    </Typography>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
