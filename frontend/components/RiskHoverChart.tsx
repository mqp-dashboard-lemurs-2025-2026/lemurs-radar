"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
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

const RiskHoverChart = ({
    data,
}: {
    data: { date: string; risk_score: number }[];
}) => {
    // Small chart used inside MUI tooltips on dashboard rows/cards.
    return (
        <Box sx={{ width: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
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

            <Box sx={{ width: "100%", height: 130, display: "flex", alignItems: "center", }}>
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
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                return `${month}/${day}`;
                            }} />
                        <YAxis dataKey="risk_score" tick={{ fontSize: 10 }} ticks={[0, 2, 4, 6, 8, 10]} range={[0, 10.5]} />
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

export default RiskHoverChart;
