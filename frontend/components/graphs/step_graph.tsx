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

interface StepsData {
  date: string;
  steps: number;
}

interface Props {
  data: StepsData[];
}

export default function StepsChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No step data available.
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
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="steps" name="Steps" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}