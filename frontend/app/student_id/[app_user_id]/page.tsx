"use client";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Select,
  MenuItem,
  Stack,
  Divider, DialogActions, DialogTitle, Dialog, TextField, DialogContent, Tooltip as MuiTooltip,
} from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import LemursHeader from "../../../components/header";
import "../../css/page.css";
import CCAPChart from "@/components/graphs/CCAP_graph";
import RiskScoreChart from "@/components/graphs/riskscore_graph";
import {formatGraphDate, formatMinutes, getRiskColor, formatDate, formatDateTime} from "@/utils/utils";
import {UserRecord, CcapScore, PastRiskScore, DangerAlertReason, HealthMetric} from "@/utils/types";
import Buttons from "@/components/student_info/buttons";
import Contact from "@/components/student_info/contact";
import Appointment from "@/components/student_info/appointment";
import Graphs from "@/components/student_info/graphs";

export default function Home() {
  // This page gathers all data needed for one student's profile.
  const [tableData, setTableData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [dangerUserIds, setDangerUserIds] = useState<number[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState<string>("");
  const [dangerAlertReason, setDangerAlertReason] = useState<DangerAlertReason[]>([]);
  const [ccapScores, setCcapScores] = useState<CcapScore[]>([]);
  const [pastRiskScores, setPastRiskScores] = useState<PastRiskScore[]>([]);
  const [selectedClinician, setSelectedClinician] = useState<string>("");
  const [selectedNextSeen, setSelectedNextSeen] = useState<string>("");

  const params = useParams();
  const router = useRouter();

  const userId = useMemo(() => {
    // Next gives dynamic route params as values, so pull out the first one.
    if (!params) return "";
    const values = Object.values(params);
    if (values.length === 0) return "";
    const v = values[0];
    return Array.isArray(v) ? (v[0] as string) : (v as string);
  }, [params]);

  const fetchData = async (id: string) => {
    // Main student record, including contact info and appointment fields.
    try {
      setLoading(true);
      setError(null);

      const endpoint = `/umass_id/${id}`;
      const response = await fetch(endpoint);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const formattedData: UserRecord[] = Array.isArray(data) ? data : [data];
      setTableData(formattedData);
    } catch (err: any) {
      setError(err.message);
      setTableData([]);
    } finally {
      setLoading(false);
      setHasTriedFetch(true);
    }
  };


  const fetchDangerAlertReason = async (id: string) => {
    // These are shown in the Past Alerts section of the appointment card.
    try {
      const endpoint = `/danger_reason/${id}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        setDangerAlertReason([]);
        return;
      }

      const data = await response.json();
      setDangerAlertReason(data || []);
    } catch (err) {
      console.error("Failed to fetch risk alert reasons", err);
      setDangerAlertReason([]);
    }
  };

  const fetchPastRiskScores = async (id: number) => {
    // Full risk history for the large risk score chart.
    try {
      const endpoint = `/past_risk_scores/${id}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        setPastRiskScores([]);
        return;
      }

      const data = await response.json();
      console.log("Fetched Past Risk Scores:", data);
      setPastRiskScores(data || []);
    } catch (err) {
      console.error("Failed to fetch Past Risk Scores", err);
      setPastRiskScores([]);
    }
  };


  // CCAP scores drive the report chart on the profile page.
  const fetchCcapScores = async (id: number) => {
    try {
      const endpoint = `/ccap_scores/${id}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        setCcapScores([]);
        return;
      }

      const data = await response.json();
      console.log("Fetched CCAP scores:", data);
      setCcapScores(data || []);
    } catch (err) {
      console.error("Failed to fetch CCAP scores", err);
      setCcapScores([]);
    }
  };

  const fetchDangerAlerts = async () => {
    // Reuse the all-alerts endpoint to mark whether this user has alerts.
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
      // sIgnore for now
      console.error("Failed to fetch risk alerts", err);
    }
  };

  const ccapData = useMemo(
        () => {
          // Recharts expects simple date/value objects.
          return ccapScores.map((c) => ({
            date: formatGraphDate(c.date),
            ccap_score: c.ccap_score,
          }));
        },
        [ccapScores]
    );

  const pastRiskData = useMemo(
      () => {
          return pastRiskScores.map((r) => ({
            date: formatGraphDate(r.timestamp),
            risk_score: r.risk_score,
          }));
      },
      [pastRiskScores]
  );

  const stepsData = useMemo(
      () =>
          healthMetrics.map((m) => ({
            date: formatGraphDate(m.date),
            steps: m.steps,
          })),
      [healthMetrics]
  );

  const screenTimeData = useMemo(
      () =>
          healthMetrics.map((m) => ({
            userId: m.app_user_id,
            date: formatGraphDate(m.date),
            durationMinutes: m.screentime_minutes,
          })),
      [healthMetrics]
  );

  const sleepData = useMemo(
      () =>
          healthMetrics.map((m) => ({
            userId: m.app_user_id,
            date: formatGraphDate(m.date),
            durationMinutes: m.sleep_minutes,
          })),
      [healthMetrics]
  );

    const BluetoothData = useMemo(
      () =>
          healthMetrics.map((m) => ({
            userId: m.app_user_id,
            date: formatGraphDate(m.date),
            bluetooth_devices_count: m.bluetooth_devices_count,
          })),
      [healthMetrics]
  );

  const fetchHealthMetrics = async (id: string) => {
    // Health metrics are split into chart-specific arrays below.
    try {
      const endpoint = `/health_metrics/${id}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        setHealthMetrics([]);
        return;
      }

      const data = await response.json();
      setHealthMetrics(data || []);
    } catch (err) {
      console.error("Failed to fetch health metrics", err);
      setHealthMetrics([]);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // Load each section independently so one missing chart does not block the page.
    fetchData(userId);
    fetchDangerAlerts();
    fetchHealthMetrics(userId);
    fetchDangerAlertReason(userId);
    fetchCcapScores(Number(userId));
    fetchPastRiskScores(Number(userId));
  }, [userId]);


  const user = tableData.length > 0 ? tableData[0] : null;
  const alertReasons = dangerAlertReason.length > 0 ? dangerAlertReason : [];

  useEffect(() => {
    if (user && selectedClinician === "") {
      // Seed editable controls from the backend once the user has loaded.
      setSelectedClinician(user.clinician || "");
      setSelectedNextSeen(user.next_seen_iso || "");
      setNoteText(user.notes || "");
    }
  }, [user]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Crisis plans are only handled in the browser for the demo.
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError("Only PDF files are allowed.");
      }
    }
  };

  const handleCrisisPlanClick = () => {
    if (selectedFile) {
      setIsFileDialogOpen(true);
    } else {
      document.getElementById("pdf-upload")?.click();
    }
  };


  const handleNotesClick = () => {
    setIsNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setIsNotesDialogOpen(false);
  };

  const updateStudentData = async (data: any) => {
    // This only works when the backend PUT route is enabled.
    try {
      await fetch(`/umass_id/${user?.app_user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // Refresh user data
      if (userId) {
        fetchData(userId);
      }
    } catch (err) {
      console.error("Failed to update student data", err);
    }
  };

  const handleSaveNote = async () => {
    setIsNotesDialogOpen(false);
    await updateStudentData({ notes: noteText });
  };

  const CardShell = ({
                       children,
                       sx,
                     }: {
    children: React.ReactNode;
    sx?: any;
  }) => (
      <Card
          sx={{
            borderRadius: 4,
            bgcolor: "background.paper",
            boxShadow: 2,
            height: "100%",
            ...sx,
          }}
      >
        <CardContent sx={{ height: "100%" }}>{children}</CardContent>
      </Card>
  );

  return (
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <LemursHeader />

        <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: "#f3f3f3",
              width: "100%",
              maxWidth: "100%",
              overflowX: "hidden",
              boxSizing: "border-box",
              px: 1,
              py: 3,
            }}
        >
          <Stack direction="row" spacing={2} sx={{mb: 2, flexWrap: "wrap"}}>
            <Buttons
                router={router}
                selectedFile={selectedFile}
                uploadError={uploadError}
                isNotesDialogOpen={isNotesDialogOpen}
                noteText={noteText}
                user={user}
                handleCrisisPlanClick={handleCrisisPlanClick}
                handleNotesClick={handleNotesClick}
                handleFileChange={handleFileChange}
                handleCloseNotesDialog={handleCloseNotesDialog}
                handleSaveNote={handleSaveNote}
                setNoteText={setNoteText}
            />
          </Stack>

          {loading && (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress/>
              </Box>
          )}

          {error && (
              <Box mt={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
          )}

          {!loading && !error && hasTriedFetch && !user && (
              <Box mt={2}>
                <Alert severity="info">
                  No data found for user ID {userId || "(missing param)"}.
                </Alert>
              </Box>
          )}

          {!loading && !error && user && (
              <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    width: "100%",
                  }}
              >
                <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                >
                  <Stack spacing={3}>
                    {/* STUDENT INFO */}
                    <Contact
                        user={user}
                        getRiskColor={getRiskColor}
                        formatDate={formatDate}
                    />

                        <Appointment
                            user={user}
                            selectedClinician={selectedClinician}
                            selectedNextSeen={selectedNextSeen}
                            alertReasons={alertReasons}
                            setSelectedClinician={setSelectedClinician}
                            setSelectedNextSeen={setSelectedNextSeen}
                            updateStudentData={updateStudentData}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                        />

                      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
                        <Box
                            sx={{
                              flex: 1,
                              borderRadius: 3,
                              borderColor: "divider",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "text.secondary",
                              minHeight: 200,
                            }}
                        >
                          <CardShell
                              sx={{
                                flex: 1,
                                p: .5,
                                minWidth: 0,
                                height: 400,
                              }}
                          >
                            <CardContent
                                sx={{
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  pb: .35
                                }}
                            >
                              <Typography variant="h6" sx={{mb: 1, textAlign: "center"}}>
                                CCAPs report
                              </Typography>
                              <CCAPChart data={ccapData} />
                            </CardContent>
                          </CardShell>
                        </Box>
                      </Box>


                  </Stack>
                </Box>


                <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                >
                  <Stack spacing={3}>

                    {/* Risk score history */}
                    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

                      <Box>

                          <CardShell
                              sx={{
                                flex: 1,
                                p: .5,
                                minWidth: 0,
                                height: 400,
                              }}
                          >
                            <CardContent
                                sx={{
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  pb: .35
                                }}
                            >
                              <MuiTooltip title="The student's assigned risk score tracking potential need for clinical intervention (0-10 scale)." arrow placement="top">
                                <Typography variant="h6" sx={{ mb: 1, textAlign: "center", cursor: "help" }}>
                                  Risk Score History
                                </Typography>
                              </MuiTooltip>
                              <RiskScoreChart data={pastRiskData} />
                            </CardContent>
                          </CardShell>
                        </Box>
                      </Box>

                    <Graphs
                        ccapData={ccapData}
                        sleepData={sleepData}
                        stepsData={stepsData}
                        screenTimeData={screenTimeData}
                        BluetoothData={BluetoothData}
                        formatMinutes={formatMinutes}
                    />

              </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
  );
}
