import React, { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Box, Paper } from "@mui/material";
import api from "../services/api";

export default function Settings() {
    const [form, setForm] = useState({ name: "", email: "" });

    useEffect(() => {
        api.get("/auth/me").then((res) => setForm(res.data));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const updateProfile = async () => {
        await api.put("/auth/me", form);
        alert("Profile updated successfully!");
    };

    return (
        <Container sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Update Profile
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
                    <TextField label="Email" name="email" value={form.email} onChange={handleChange} />
                    <Button
                        variant="contained"
                        sx={{ background: "linear-gradient(90deg, #13a898, #4f46e5)" }}
                        onClick={updateProfile}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
