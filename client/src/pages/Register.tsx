import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    Grid
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErr("Passwords do not match!");
            return;
        }

        try {
            const res = await api.post("/auth/register", {
                fullName,
                username,
                email,
                phone,
                password,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/login");
        } catch (err: any) {
            setErr(err.response?.data?.msg || "Register failed");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #13a898 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={12}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        textAlign: "center",
                        background: "white",
                        boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: "bold",
                            mb: 1,
                            background: "linear-gradient(90deg,#13a898,#4f46e5)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        CollabBoard
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 3, color: "#666" }}>
                        Join now and start collaborating creatively!
                    </Typography>

                    {err && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {err}
                        </Alert>
                    )}

                    <form onSubmit={handleRegister}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    variant="outlined"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    variant="outlined"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    variant="outlined"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4, md: 6, xl: 6 }} container >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        px: 6,
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        borderRadius: 3,
                                        background: "linear-gradient(90deg, #13a898, #4f46e5)",
                                        "&:hover": {
                                            background: "linear-gradient(90deg, #119987, #4036d6)",
                                        },
                                    }}
                                >
                                    Register
                                </Button>
                            </Grid>

                        </Grid>
                    </form>


                    <Typography variant="body2" sx={{ mt: 3, color: "#555" }}>
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={{
                                color: "#4f46e5",
                                fontWeight: "bold",
                                textDecoration: "none",
                            }}
                        >
                            Login
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
