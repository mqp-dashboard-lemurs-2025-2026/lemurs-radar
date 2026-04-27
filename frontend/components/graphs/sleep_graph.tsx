"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface SleepData {
  date: string;
  durationMinutes: number;
}

interface Props {
  data: SleepData[];
  formatMinutes: (mins: number) => string;
}

export default function SleepChart({ data, formatMinutes }: Props) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No sleep data available.
      </Typography>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 15, bottom: 35, left: -20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          
          {/* Format Y axis as hh:mm */}
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={formatMinutes}
          />

          {/* Format tooltip as hh:mm */}
          <Tooltip
            formatter={(value) =>
              formatMinutes(value as number)
            }
          />

          <Bar
            dataKey="durationMinutes"
            name="Sleep Duration"
            fill="#1976d2"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}