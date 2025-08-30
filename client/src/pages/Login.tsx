import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  console.log({
    env: import.meta.env.VITE_SOCKET_URL,
    env1: import.meta.env.VITE_API_URL,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setErr(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #13a898 0%, #4f46e5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            textAlign: "center",
            background: "#fff",
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
            Welcome back Login to continue
          </Typography>

          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
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
              Login
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, color: "#555" }}>
            Don’t have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#4f46e5",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Register
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
