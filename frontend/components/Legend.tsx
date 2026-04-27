"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

export default function Legend() {
    const [legendMinimized, setLegendMinimized] = useState(false);

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                zIndex: 1000,
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                minWidth: "150px",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: legendMinimized ? 0 : 1,
                    cursor: "pointer",
                }}
                onClick={() => setLegendMinimized(!legendMinimized)}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Legend
                </Typography>
                <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                        {legendMinimized ? "[+]" : "[-]"}
                    </Typography>
                </Box>
            </Box>

            {!legendMinimized && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <img src="/exclamation-mark-icon.png" alt="Risk alert" style={{ width: 20, height: 20 }} />
                        <Typography variant="body2">Risk Alert</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ color: '#E53935', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, transform: 'rotate(-45deg)' }}>
                                ➔
                            </Typography>
                        </Box>
                        <Typography variant="body2">Risk Increased</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ color: '#43A047', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, transform: 'rotate(45deg)' }}>
                                ➔
                            </Typography>
                        </Box>
                        <Typography variant="body2">Risk Decreased</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ color: '#888', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>
                                ➔
                            </Typography>
                        </Box>
                        <Typography variant="body2">No Change</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900 }}>
                                EC
                            </Typography>
                        </Box>
                        <Typography variant="body2">Emergency Contact</Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
