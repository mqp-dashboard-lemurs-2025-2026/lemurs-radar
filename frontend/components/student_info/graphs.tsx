import {Box, Card, CardContent, Tooltip as MuiTooltip, Typography} from "@mui/material";


import CCAPChart from "../graphs/CCAP_graph";
import SleepChart from "../graphs/sleep_graph";
import StepsChart from "../graphs/step_graph";
import ScreenTimeChart from "../graphs/screentime_graph";
import BluetoothChart from "../graphs/bluetooth_graph";
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
type GraphsProps = {
    ccapData: any[];
    sleepData: any[];
    stepsData: any[];
    screenTimeData: any[];
    BluetoothData: any[];
    formatMinutes: (minutes: number) => string;
};

// Shared card wrapper keeps graph sizing consistent on the student page.
function ChartCard({
                       title,
                       tooltip,
                       height,
                       children,
                   }: {
    title: string;
    tooltip: string;
    height: number;
    children: React.ReactNode;
}) {
    return (
        <CardShell
            sx={{
                flex: 1,
                p: 0,
                minWidth: 0,
                height,
            }}
        >
            <CardContent
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    pb: 0.35,
                }}
            >
                <MuiTooltip title={tooltip} arrow placement="top">
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ textAlign: "center", cursor: "help" }}
                    >
                        {title}
                    </Typography>
                </MuiTooltip>

                {children}
            </CardContent>
        </CardShell>
    );
}

export function CCAPGraph({ ccapData }: { ccapData: any[] }) {
    return (
        <CardShell sx={{ flex: 1, p: 0.5, minWidth: 0, height: 400 }}>
            <CardContent
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    pb: 0.35,
                }}
            >
                <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
                    CCAPs report
                </Typography>

                <CCAPChart data={ccapData} />
            </CardContent>
        </CardShell>
    );
}

export default function Graphs({
                                   sleepData,
                                   stepsData,
                                   screenTimeData,
                                   BluetoothData,
                                   formatMinutes,
                               }: GraphsProps) {
    // Data is already shaped by the page component before it reaches these charts.
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    px: 0.5,
                    py: 0.5,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ChartCard
                        title="Sleep (hh:mm)"
                        tooltip="Total recorded hours and minutes of sleep per day."
                        height={380}
                    >
                        <SleepChart data={sleepData} formatMinutes={formatMinutes} />
                    </ChartCard>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ChartCard
                        title="Steps"
                        tooltip="Total physical steps logged per day."
                        height={380}
                    >
                        <StepsChart data={stepsData} />
                    </ChartCard>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    px: 0.5,
                    py: 0.5,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ChartCard
                        title="Screen Time (hh:mm)"
                        tooltip="Total daily active screen time recorded across devices."
                        height={405}
                    >
                        <ScreenTimeChart
                            data={screenTimeData}
                            formatMinutes={formatMinutes}
                        />
                    </ChartCard>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ChartCard
                        title="Social Engagement"
                        tooltip="Number of unique Bluetooth devices nearby over time, an indicator of social engagement."
                        height={405}
                    >
                        <BluetoothChart data={BluetoothData} />
                    </ChartCard>
                </Box>
            </Box>
        </>
    );
}