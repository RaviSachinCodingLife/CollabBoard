import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
} from "@mui/material";
import {
    Groups,
    Dashboard,
    Cloud,
    Security,
    AddBox,
    Workspaces,
    Description,
    Pending,
    Star,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const features = [
    {
        title: "Collaborate Easily",
        icon: <Groups fontSize="large" />,
        desc: "Work together with your team in real-time with live sync.",
        route: "/workinprogress",
    },
    {
        title: "Organize Boards",
        icon: <Dashboard fontSize="large" />,
        desc: "Create interactive boards to manage projects and workflows.",
        route: "/workinprogress",
    },
    {
        title: "Cloud Sync",
        icon: <Cloud fontSize="large" />,
        desc: "Access all your documents securely from anywhere, anytime.",
        route: "/workinprogress",
    },
    {
        title: "Secure & Reliable",
        icon: <Security fontSize="large" />,
        desc: "Your data is encrypted and protected with enterprise-grade security.",
        route: "/workinprogress",
    },
    {
        title: "Create a New Board",
        icon: <AddBox fontSize="large" />,
        desc: "Start fresh with a new board for your ideas and notes.",
        route: "/dashboard",
    },
    {
        title: "Team Workspace",
        icon: <Workspaces fontSize="large" />,
        desc: "Collaborate with teammates in a shared workspace.",
        route: "/workinprogress",
    },
    {
        title: "Manage Documents",
        icon: <Description fontSize="large" />,
        desc: "Keep your files organized with tags and categories.",
        route: "/workinprogress",
    },
    {
        title: "Flow Chart",
        icon: <Pending fontSize="large" />,
        desc: "Stay tuned for upcoming features like AI-powered notes!",
        route: "/workinprogress",
    },
    {
        title: "Premium Features",
        icon: <Star fontSize="large" />,
        desc: "Unlock more with advanced tools and customization options.",
        route: "/workinprogress",
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f5f7fb",
                py: 2,
                background: "linear-gradient(180deg, #f5f7fb 0%, #e4e8ff 100%)",
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        background: "linear-gradient(90deg,#13a898,#4f46e5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Welcome to CollabBoard
                </Typography>
                <Typography
                    variant="h6"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 5, maxWidth: "700px", mx: "auto" }}
                >
                    A modern platform for teamwork, brainstorming, and document
                    collaboration.
                </Typography>

                {/* Features Grid */}
                <Grid container spacing={6}>
                    {features.map((f, i) => (
                        <Grid size={{ xs: 12, sm: 2, md: 4, xl: 4 }} key={i} mt={5}>
                            <Paper
                                onClick={() => navigate(f.route)}
                                sx={{
                                    height: "100%",
                                    p: 4,
                                    textAlign: "center",
                                    borderRadius: 4,
                                    bgcolor: "#fff",
                                    border: "1px solid #e0e0e0",
                                    boxShadow: 3,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    position: "relative",
                                    "&:hover": {
                                        transform: "translateY(-10px) scale(1.03)",
                                        boxShadow: 8,
                                        borderColor: "#13a898",
                                    },
                                }}
                            >
                                {/* Accent bar */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "5px",
                                        borderTopLeftRadius: "16px",
                                        borderTopRightRadius: "16px",
                                        background: "linear-gradient(90deg,#13a898,#4f46e5)",
                                    }}
                                />

                                <Box
                                    sx={{
                                        color: "#4f46e5",
                                        mb: 2,
                                        fontSize: "2.5rem",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    {f.icon}
                                </Box>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{ fontWeight: "600" }}
                                >
                                    {f.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ flexGrow: 1 }}
                                >
                                    {f.desc}
                                </Typography>
                                <Button
                                    variant="text"
                                    sx={{
                                        mt: 3,
                                        fontWeight: "bold",
                                        color: "#13a898",
                                        textTransform: "none",
                                    }}
                                >
                                    Learn More →
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* CTA Section */}
                <Box textAlign="center" mt={16}>
                    <Typography variant="h5" gutterBottom fontWeight="600">
                        Ready to start collaborating?
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 3,
                            px: 5,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            background: "linear-gradient(90deg,#13a898,#4f46e5)",
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Get Started
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
