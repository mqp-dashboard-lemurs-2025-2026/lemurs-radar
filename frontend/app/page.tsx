"use client";
import {
    Alert,
    AppBar,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Pagination,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import React, { useEffect, useState, useMemo } from "react";
import "./css/page.css";
import dynamic from "next/dynamic";
const LemursHeader = dynamic(() => import("../components/header"), { ssr: false });

import { UserRecord, PastRiskScore } from "./types";
import StudentCard from "../components/StudentCard";
import StudentListRow from "../components/StudentListRow";
import Legend from "../components/Legend";


export default function Home() {
    // This page owns the dashboard filters and sends them to /umass_id.
    const [tableData, setTableData] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clinicians, setClinicians] = useState<string[]>([]);
    const [pageCount, setPageCount] = useState(1);
    const [userId, setUserId] = useState<string>("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("risk");
    const [searchMode, setSearchMode] = useState<"id" | "name" | "preferredName" | "phone">("id");
    const [selectedStudent, setSelectedStudent] = useState<UserRecord | null>(null);
    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState<{ [id: number]: string }>({});
    const [currentNote, setCurrentNote] = useState("");
    const [dangerUserIds, setDangerUserIds] = useState<number[]>([]);
    const [selectedClinician, setSelectedClinician] = useState("All");
    const [selectedRiskLevel, setSelectedRiskLevel] = useState("All");
    const [hasActiveAlert, setHasActiveAlert] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState("All");
    const [pastRiskScores, setPastRiskScores] = useState<PastRiskScore[]>([]);
    const [legendMinimized, setLegendMinimized] = useState(false);
    const [page, setPage] = useState(1);


    const router = useRouter();

    const itemsPerPage = 12;

    const fetchClinicians = async () => {
        // Clinician names come from the backend so seeded data stays flexible.
        try {
            const response = await fetch("/clinicians");
            if (response.ok) {
                const data = await response.json();
                setClinicians(data);
            }
        } catch (e) {
            console.error("Failed to fetch clinicians", e);
        }
    };

    const fetchData = async () => {
        // Query names here must match the FastAPI parameters in students.py.
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                limit: itemsPerPage.toString(),
                offset: ((page - 1) * itemsPerPage).toString(),
            });

            if (userId.trim()) {
                params.append("search_term", userId.trim());
                params.append("search_mode", searchMode);
            }
            if (selectedClinician !== "All") params.append("clinician", selectedClinician);
            if (selectedRiskLevel !== "All") params.append("risk_level", selectedRiskLevel);
            if (hasActiveAlert) params.append("active_alert", "true");
            if (selectedAppointment !== "All") params.append("appointment", selectedAppointment);
            params.append("sort_by", sortBy);

            const endpoint = `/umass_id?${params.toString()}`;
            const response = await fetch(endpoint, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const jsonObject = await response.json();
            let data = jsonObject.data || [];
            let formattedData: UserRecord[] = Array.isArray(data) ? data : [data];

            // Fill in display defaults so the cards do not need extra null checks.
            formattedData = formattedData.map(user => ({
                ...user,
                preferred_name: user.preferred_name || user.first_name,
                pronouns: user.pronouns || "N/A",
                ec_name: user.ec_name || "N/A",
                ec_relationship: user.ec_relationship || "N/A",
                ec_phone: user.ec_phone || "N/A",
                photo_url: user.profile_picture || "/default-profile.png" // Mock
            }));

            setTableData(formattedData);
            setPageCount(Math.ceil((jsonObject.total_count || 0) / itemsPerPage));
        } catch (err: any) {
            setError(err.message);
            setTableData([]);
            setPageCount(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchDangerAlerts = async () => {
        // The dashboard only needs to know which students should show the alert icon.
        try {
            const endpoint = "/danger_alert";
            const response = await fetch(endpoint);
            if (!response.ok) return;
            const data = await response.json();
            // collect unique user ids that have risk alerts
            const ids = Array.from(
            new Set<number>(
                (data || [])
                .map((d: any) => Number(d.app_user_id))
                .filter((id: number) => Number.isFinite(id))
            )
            );
            setDangerUserIds(ids);
        } catch (err) {
            // Ignored for now
            console.error("Failed to fetch risk alerts", err);
        }
    };


    const fetchPastRiskScores = async (id: number) => {
        // Risk history is lazy-loaded when a user hovers a score.
        try {
            const response = await fetch(`/past_risk_scores/${id}`);
            if (!response.ok) return;

            const data = await response.json();

            setHoverRiskData((prev) => ({
                ...prev,
                [id]: data || [],
            }));
        } catch (err) {
            console.error("Failed to fetch Past Risk Scores", err);
        }
    };

    const [hoverRiskData, setHoverRiskData] = useState<{
        [userId: number]: PastRiskScore[];
    }>({});

    useEffect(() => {
        // Any filter change should return the dashboard to the first page.
        setPage(1);
    }, [userId, searchMode, selectedClinician, selectedRiskLevel, hasActiveAlert, selectedAppointment, sortBy]);

    useEffect(() => {
        // Debounce live search so typing does not fire a request on every key.
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [page, userId, searchMode, selectedClinician, selectedRiskLevel, hasActiveAlert, selectedAppointment, sortBy]);

    useEffect(() => {
        fetchClinicians();
        fetchDangerAlerts();
    }, []);

    const paginatedData = tableData;

    return (
        <>
            <LemursHeader />

            <Box sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
                        <Select
                            value={searchMode}
                            onChange={(e: any) => setSearchMode(e.target.value as "id" | "name" | "preferredName" | "phone")}
                            size="small"
                            sx={{ width: "150px" }}
                        >
                            <MenuItem value="id">ID</MenuItem>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="preferredName">Preferred Name</MenuItem>
                            <MenuItem value="phone">Phone</MenuItem>
                        </Select>
                        <TextField
                            type={searchMode === "id" ? "number" : searchMode === "phone" ? "tel" : "text"}
                            label={`Search by ${searchMode === "id" ? "ID" : searchMode === "name" ? "Name" : searchMode === "preferredName" ? "Preferred Name" : "Phone"}...`}
                            value={userId}
                            onChange={(e: any) => setUserId(e.target.value)}
                            size="small"
                            sx={{ width: "400px", }}
                        // onKeyDown removed since search is now live via Effect
                        />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>

                        <Box
                            sx={{
                                px: 2.5,
                                py: 1,
                                fontSize: "16px",
                            }}
                        >
                            Sort By:
                        </Box>
                        <Select
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            size="small"
                            sx={{ width: "150px" }}
                        >
                            <MenuItem value="risk">Risk Score</MenuItem>
                            <MenuItem value="firstName">First Name</MenuItem>
                            <MenuItem value="lastName">Last Name</MenuItem>
                            <MenuItem value="preferredName">Preferred Name</MenuItem>
                            <MenuItem value="appointment">Next Appointment</MenuItem>
                            <MenuItem value="id">ID</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                            sx={{
                                px: 2.5,
                                py: 1,
                                fontSize: "16px",
                            }}
                        >
                            Filter By:
                        </Box>
                        <Autocomplete
                            value={selectedClinician === "All" ? null : selectedClinician}
                            onChange={(_, newValue) => setSelectedClinician(newValue || "All")}
                            options={clinicians}
                            renderInput={(params) => <TextField {...params} size="small" placeholder="Clinician" />}
                            size="small"
                            sx={{ width: "200px" }}
                        />
                        <Autocomplete
                            value={selectedRiskLevel === "All" ? null : selectedRiskLevel}
                            onChange={(_, newValue) => setSelectedRiskLevel(newValue || "All")}
                            options={["Low (0-3)", "Medium (4-7)", "High (8-10)"]}
                            renderInput={(params) => <TextField {...params} size="small" placeholder="Risk Level" />}
                            size="small"
                            sx={{ width: "180px", ml: 2 }}
                        />
                        <Autocomplete
                            value={selectedAppointment === "All" ? null : selectedAppointment}
                            onChange={(_, newValue) => setSelectedAppointment(newValue || "All")}
                            options={["Yesterday", "Today", "Next 3 Days", "Next 7 Days"]}
                            renderInput={(params) => <TextField {...params} size="small" placeholder="Next Appointment" />}
                            size="small"
                            sx={{ width: "180px", ml: 2 }}
                        />
                        <ToggleButton
                            value="check"
                            selected={hasActiveAlert}
                            onChange={() => setHasActiveAlert(!hasActiveAlert)}
                            size="small"
                            sx={{ ml: 2, height: '40px' }}
                            color="error"
                        >
                            <img src="/exclamation-mark-icon.png" alt="Risk alert" style={{ width: 20, height: 20, marginRight: 8 }} />
                            Active Alerts
                        </ToggleButton>
                    </Box>


                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, val) => val && setViewMode(val)}
                        size="small"
                    >
                        <ToggleButton value="grid">Grid</ToggleButton>
                        <ToggleButton value="list">List</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {loading && (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        Error: {error}
                    </Alert>
                )}
                {/* Grid View */}
                {!loading && !error && tableData.length > 0 && (
                    <>
                        {viewMode === "grid" && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
                                {paginatedData.map((row) => (
                                    <Box key={row.app_user_id} sx={{ display: 'flex' }}>
                                        <StudentCard 
                                            row={row} 
                                            dangerUserIds={dangerUserIds} 
                                            hoverRiskData={hoverRiskData} 
                                            fetchPastRiskScores={fetchPastRiskScores} 
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* List View */}
                        {viewMode === "list" && (
                            <Box sx={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",

                                        marginTop: "1rem",
                                    }}

                                >{/* Table Headers */}
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f8f8" }}>
                                            <th style={{ textAlign: "left", padding: "8px" }}>
                                                Name
                                            </th>
                                            <th style={{ textAlign: "left", padding: "8px" }}>
                                                Phone Number
                                            </th>
                                            <th style={{ textAlign: "left", padding: "8px" }}>
                                                Emergency Contact
                                            </th>
                                            <th style={{ textAlign: "left", padding: "8px" }}>
                                                Risk Score
                                            </th>
                                            <th style={{ textAlign: "left", padding: "8px" }}>
                                                Clinician
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((row) => (
                                        <StudentListRow 
                                            key={row.app_user_id} 
                                            row={row} 
                                            dangerUserIds={dangerUserIds} 
                                            hoverRiskData={hoverRiskData} 
                                            fetchPastRiskScores={fetchPastRiskScores} 
                                        />
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        )}

                        {pageCount > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
                                <Pagination 
                                    count={pageCount} 
                                    page={page} 
                                    onChange={(_, value) => {
                                        setPage(value);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }} 
                                    color="primary" 
                                    size="large"
                                />
                            </Box>
                        )}
                    </>
                )}
                {!loading && !error && tableData.length === 0 && (
                    <Typography sx={{ color: "#555", mt: 2 }}>No users found.</Typography>
                )}
            </Box>

            {/* Legend */}
            <Legend />
        </>
    );
}
