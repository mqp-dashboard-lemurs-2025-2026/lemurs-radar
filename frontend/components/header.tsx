"use client";
import {
    Alert,
    AppBar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Switch,
    Toolbar,
    Typography,
    FormGroup,
    Checkbox,
    Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import React, { useEffect, useState } from "react";
import "../app/css/page.css";

interface AlertRecord {
    first_name: string;
    last_name: string;
    answer_id: number;
    clinician_name: string;
    created_at: string;
}

export default function LemursHeader() {
    const router = useRouter();
    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alertsAnchor, setAlertsAnchor] = useState<null | HTMLElement>(null);
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [tableData, setTableData] = useState<AlertRecord[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const visibleAlerts = alertsEnabled ? tableData : [];

    const fetchData = async () => {
        // Header badge uses the same alert endpoint as the alerts page.
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

    useEffect(() => {
        fetchData();
    }, []);

    const openProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchor(event.currentTarget);
    };

    const closeProfileMenu = () => {
        setProfileAnchor(null);
    };

    const openAlertsMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAlertsAnchor(event.currentTarget);
    };

    const closeAlertsMenu = () => {
        setAlertsAnchor(null);
    };

    
    const [officeHours, setOfficeHours] = useState({
        start: "",
        end: "",
    });

    const [officeDays, setOfficeDays] = useState<string[]>([]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Alert hour settings are local UI
    const handleHoursChange =
        (field: "start" | "end") =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setOfficeHours((prev) => ({
                    ...prev,
                    [field]: event.target.value,
                }));
            };

    const handleToggleDay = (day: string) => () => {
        setOfficeDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day]
        );
    };

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

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: "#1c5f6e",
                boxShadow: "none",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    minHeight: "100px",
                    px: 6,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                        component="img"
                        src="/LEMURS_Logo.png"
                        alt="LEMURS Logo"
                        onClick={() => router.push("/")}
                        style={{ cursor: "pointer" }}
                        sx={{
                            height: "100px",
                            width: "auto",
                            objectFit: "contain",
                            transform: "scale(1.5) translateX(10px)",
                            transformOrigin: "right center",
                        }}
                    />
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: 50,
                            fontWeight: 10,
                            color: "white",
                            fontFamily: "monospace",
                            letterSpacing: 1,
                        }}
                    >
                        LEMURS RADAR
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>

                    <IconButton
                        color="inherit"
                        onClick={openAlertsMenu}
                        sx={{ transform: "scale(1.6)" }}
                    >
                        <Badge
                            badgeContent={tableData.length}
                            color="error"
                            showZero
                            sx={{
                                "& .MuiBadge-badge": {
                                    fontSize: "0.6rem",
                                    minWidth: 14,
                                    height: 14,
                                    px: 0.5,
                                },
                            }}
                        >
                            <NotificationsNoneIcon sx={{ fontSize: 28 }} />
                        </Badge>
                    </IconButton>

                    <FormControlLabel
                        label="Alerts"
                        labelPlacement="start"
                        control={
                            <Switch
                                checked={alertsEnabled}
                                onChange={(e) => setAlertsEnabled(e.target.checked)}
                            />
                        }
                        sx={{
                            m: 0,
                            ml: 1,
                            "& .MuiFormControlLabel-label": {
                                color: "white",
                                fontFamily: "monospace",
                                fontSize: "0.95rem",
                            },
                        }}
                    />



                    <Menu
                        anchorEl={alertsAnchor}
                        open={Boolean(alertsAnchor)}
                        onClose={closeAlertsMenu}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        PaperProps={{
                            elevation: 4,
                            sx: {
                                borderRadius: "12px",
                                mt: 1,
                                minWidth: 220,
                            },
                        }}
                    >
                        {visibleAlerts.length === 0 ? (
                            <MenuItem disabled>No alerts to show</MenuItem>
                        ) : (
                            tableData.map((row) => (
                                <MenuItem key = {row.answer_id + row.created_at} onClick={closeAlertsMenu}>
                                    <b>{row.first_name} {row.last_name}</b>
                                    &nbsp;&nbsp;&nbsp;
                                    <br />
                                    <span style={{ opacity: 0.7 }}>{formatDate(row.created_at)}</span>
                                </MenuItem>
                            ))
                        )}

                        <Button
                            variant="outlined"
                            sx={{ m: 1 }}
                            onClick={() => {
                                closeAlertsMenu();
                                router.push("/alerts");
                            }}
                        >
                           View All Alerts
                        </Button>
                    </Menu>

                    <IconButton
                        color="inherit"
                        onClick={openProfileMenu}
                        sx={{ transform: "scale(2.0)" }}
                    >
                        <AccountCircleIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                    <Menu
                        anchorEl={profileAnchor}
                        open={Boolean(profileAnchor)}
                        onClose={closeProfileMenu}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        PaperProps={{
                            elevation: 4,
                            sx: {
                                borderRadius: "12px",
                                mt: 1,
                                minWidth: 260,
                            },
                        }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Alert Hours
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                <TextField
                                    label="Start"
                                    type="time"
                                    size="small"
                                    value={officeHours.start}
                                    onChange={handleHoursChange("start")}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    fullWidth
                                />
                                <TextField
                                    label="End"
                                    type="time"
                                    size="small"
                                    value={officeHours.end}
                                    onChange={handleHoursChange("end")}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    fullWidth
                                />
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Alert Days
                            </Typography>
                            <FormGroup row>
                                {daysOfWeek.map((day) => (
                                    <FormControlLabel
                                        key={day}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={officeDays.includes(day)}
                                                onChange={handleToggleDay(day)}
                                            />
                                        }
                                        label={day}
                                        sx={{ mr: 1 }}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <MenuItem onClick={closeProfileMenu}>My Profile</MenuItem>
                        <MenuItem onClick={closeProfileMenu}>Settings</MenuItem>
                        <MenuItem
                            onClick={() => {
                                closeProfileMenu();
                                console.log("Signing out...");
                            }}
                            sx={{ color: "error.main" }}
                        >
                            Sign Out
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
