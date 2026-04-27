"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface RiskScoreData {
  date: string;
  risk_score: number | string;
}

interface Props {
  data: RiskScoreData[];
}

export default function RiskScoreChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No Risk Score data available.
      </Typography>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 15, bottom: 35, left: -20 }}
        >
          {/* Background risk zones */}
          <ReferenceArea y1={0} y2={4} fill="#90EE90" />
          <ReferenceArea y1={4} y2={7} fill="#FFCE1B" />
          <ReferenceArea y1={7} y2={10} fill="#FF8080" />

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            ticks={[0, 2, 4, 6, 8, 10]}
            domain={[0, 10]}
          />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="risk_score"
            name="Risk Score"
            stroke="#1976d2"
            strokeWidth={4}
            dot={{ r: 3 }}
            isAnimationActive={false} // helps performance/debugging
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}