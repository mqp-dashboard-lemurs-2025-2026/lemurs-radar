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

interface Props {
  data: { date: string; ccap_score: number }[];
}

export default function CCAPChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No CCAPs data available.
      </Typography>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 15, bottom: 35, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="ccap_score" name="CCAP score" fill="#2d8397" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}