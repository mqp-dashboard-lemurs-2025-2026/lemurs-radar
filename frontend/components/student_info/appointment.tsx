import {
    Box, Card, CardContent,
    Divider,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";

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

export default function Appointment({
                                        user,
                                        selectedClinician,
                                        selectedNextSeen,
                                        alertReasons,
                                        setSelectedClinician,
                                        setSelectedNextSeen,
                                        updateStudentData,
                                        formatDate,
                                        formatDateTime,
                                    }: AppointmentProps) {
    // The clinician and next appointment controls save as soon as they change.
    return (
        <CardShell
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 385,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 1.5,
                    p: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: 92 }}>
                        Clinician:
                    </Typography>

                    <Select
                        value={selectedClinician}
                        size="small"
                        sx={{ minWidth: 220 }}
                        onChange={async (e) => {
                            const clinician = e.target.value;
                            setSelectedClinician(clinician);

                            try {
                                await updateStudentData({ clinician });
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    >
                        <MenuItem value="Dr. Jane">Dr. Jane</MenuItem>
                        <MenuItem value="Dr. Bob">Dr. Bob</MenuItem>
                    </Select>
                </Box>

                <Typography variant="body1">
                    Last Seen: {formatDate(user.last_appointment_time)}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: 92 }}>
                        Next Appt:
                    </Typography>

                    <TextField
                        type="datetime-local"
                        size="small"
                        value={selectedNextSeen}
                        sx={{ minWidth: 220 }}
                        onChange={async (e) => {
                            // Empty field clears the appointment instead of sending an empty string.
                            const rawValue = e.target.value;
                            const next_seen = rawValue === "" ? null : rawValue;

                            setSelectedNextSeen(rawValue);

                            try {
                                await updateStudentData({ next_seen });
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    />
                </Box>
            </Box>

            <Divider />

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    overflow: "hidden",
                }}
            >
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Past Alerts:
                </Typography>

                {alertReasons.length === 0 ? (
                    <Typography variant="body1">No alerts currently</Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.75,
                            overflowY: "auto",
                        }}
                    >
                        {alertReasons.slice(0, 3).map((reason, index) => (
                            <Typography key={index} variant="body1">
                                • {formatDateTime(reason.created_at)}, {reason.alert_message}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
        </CardShell>
    );
}