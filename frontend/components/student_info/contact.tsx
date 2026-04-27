import {
    Box, Card,
    CardContent,
    Divider,
    Typography,
} from "@mui/material";

import {formatDate, getRiskColor} from "@/utils/utils";
import React from "react";

type ContactProps = {
    user: any;
    getRiskColor: (score: number | null | undefined) => string;
    formatDate: (date: string | null | undefined) => string;
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

export default function Contact({
                                    user,
                                    getRiskColor,
                                    formatDate,
                                }: ContactProps) {
    // Contact fields are shown as received from the backend, with simple fallbacks.
    return (
        <CardShell
            sx={{
                borderLeft: 8,
                borderLeftColor: getRiskColor(user.risk_score),
            }}
        >
            <Box sx={{display: "flex", gap: 2, alignItems: "center", height: 254}}>
                <Box
                    sx={{
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        bgcolor: "#e7e7e7",
                        overflow: "hidden",
                        border: "2px solid #7fb9c9",
                        boxSizing: "border-box",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={"/profile-pictures/" + user.profile_picture + ".jpg" || "/default-profile.png"}
                        alt="Student"
                        style={{width: "100%", height: "100%", objectFit: "cover"}}
                        onError={(e) => {
                            // Hide broken mock photos instead of showing the browser icon.
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />
                </Box>

                <Box sx={{minWidth: 0, flex: 1}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap"}}>
                        <Typography variant="h4" sx={{lineHeight: 1.1}}>
                            {user.first_name} {user.last_name}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{mt: 0.5}}>
                        {user.first_name} ({user.pronouns})
                    </Typography>
                    <Typography variant="body1" sx={{mt: 0.5}}>
                        ID: {user.umass_id} &nbsp;&nbsp; DOB: {formatDate(user.date_of_birth)}
                        &nbsp;&nbsp;
                    </Typography>
                </Box>
                <CardContent>
                    <Box sx={{ width: "100%", height: 100 }}>
                        <Box
                            sx={{
                                width: 140,
                                minWidth: 140,
                                borderRadius: 4,
                                border: `6px solid ${getRiskColor(user.risk_score)}`,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#efefef",
                                py: 2,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Risk Level
                            </Typography>
                            <Typography sx={{ fontSize: 64, lineHeight: 1, fontWeight: 500 }}>
                                {user.risk_score ?? "-"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Box>

            <Box sx={{display: "flex", flexDirection: "column", gap: 1.25}}>
                <Box sx={{display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap"}}>
                    <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                        <img src="/phone-icon.png" alt="phone" style={{width: 22, height: 22}}/>
                        <Typography variant="body1">
                            {user.phone_number || "N/A"}
                        </Typography>
                    </Box>


                </Box>

                <Divider/>
                <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                    <img src="/email-icon.png" alt="email" style={{width: 22, height: 22}}/>
                    <Typography variant="body1" sx={{wordBreak: "break-word"}}>
                        {user.email || "N/A"}
                    </Typography>
                </Box>

                <Divider/>
                <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                    <img src="/emergency-icon.png" alt="phone" style={{width: 22, height: 22}}/>
                    <Typography variant="body1" sx={{wordBreak: "break-word"}}>
                        {user.ec_name || "N/A"}: {user.ec_phone || "N/A"} ({user.ec_relationship || "N/A"})
                    </Typography>
                </Box>



            </Box>
        </CardShell>

    );
}
