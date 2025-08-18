import React from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
} from "@mui/material";
import { PendingActions } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function WorkInProgress() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f5f7fb",
                py: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #13a898 0%, #4f46e5 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={6}
                    sx={{
                        p: 6,
                        textAlign: "center",
                        borderRadius: 4,
                        bgcolor: "#fff",
                        boxShadow: 6,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: 10,
                        },
                    }}
                >
                    <Box
                        sx={{
                            color: "#4f46e5",
                            fontSize: "4rem",
                            display: "flex",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <PendingActions fontSize="inherit" />
                    </Box>

                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            background: "linear-gradient(90deg,#13a898,#4f46e5)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: "bold",
                        }}
                    >
                        Work in Progress
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        We’re building something awesome here!
                        Stay tuned for exciting new features that will make collaboration
                        even more powerful.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            px: 5,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: "1rem",
                            fontWeight: "bold",
                            background: "linear-gradient(90deg,#13a898,#4f46e5)",
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}
