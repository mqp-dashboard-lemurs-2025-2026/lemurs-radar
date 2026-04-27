"use client";

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";

type ButtonsProps = {
    router: any;
    selectedFile: File | null;
    uploadError: string | null;
    isNotesDialogOpen: boolean;
    noteText: string;
    user: any;
    handleCrisisPlanClick: () => void;
    handleNotesClick: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCloseNotesDialog: () => void;
    handleSaveNote: () => void;
    setNoteText: (value: string) => void;
};

export default function Buttons({
                                    router,
                                    selectedFile,
                                    uploadError,
                                    isNotesDialogOpen,
                                    noteText,
                                    user,
                                    handleCrisisPlanClick,
                                    handleNotesClick,
                                    handleFileChange,
                                    handleCloseNotesDialog,
                                    handleSaveNote,
                                    setNoteText,
                                }: ButtonsProps) {
    // These actions live here so the profile page stays focused on data loading.
    return (
        <>
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={() => router.push("/")}>
                    ← Back
                </Button>

                <Button variant="outlined" onClick={handleCrisisPlanClick}>
                    Crisis Plan
                </Button>

                <Button variant="outlined" onClick={handleNotesClick}>
                    Notes
                </Button>

                <Button
                    variant="outlined"
                    onClick={() =>
                        window.open("https://www.titaniumschedule.com/Main/", "_blank")
                    }
                >
                    Open in EMR
                </Button>
            </Stack>

            <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {selectedFile && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Uploaded: {selectedFile.name}
                </Alert>
            )}

            {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                </Alert>
            )}

            <Dialog open={isNotesDialogOpen} onClose={handleCloseNotesDialog} fullWidth>
                <DialogTitle>
                    Notes about {user?.first_name} {user?.last_name}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        autoFocus
                        id="note"
                        label="Write your notes here"
                        multiline
                        rows={4}
                        value={noteText}
                        fullWidth
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveNote();
                            }
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseNotesDialog}>Cancel</Button>
                    <Button onClick={handleSaveNote} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}