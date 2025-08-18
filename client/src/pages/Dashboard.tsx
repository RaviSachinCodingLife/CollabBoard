import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container, Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Divider
} from "@mui/material";
import {
    Logout,
    Settings,
    Home,
    Description
} from "@mui/icons-material";
import HomePage from "./Home";
import Documents from "./Documents";

type User = {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
};


export default function Dashboard() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const [activePage, setActivePage] = useState<"home" | "documents">("home");


    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);


    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const initials =
        user?.fullName
            ? user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "U";

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: 240,
                        boxSizing: "border-box",
                        bgcolor: "#1e1f24",
                        color: "#fff",
                    },
                }}
            >
                <Toolbar>
                    <Avatar sx={{ bgcolor: "#13a898", mr: 1 }}>CB</Avatar>
                    <Typography variant="h6" noWrap>
                        CollabBoard
                    </Typography>
                </Toolbar>
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activePage === "home"}
                            onClick={() => setActivePage("home")}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    bgcolor: "rgba(79,70,229,0.15)",
                                    border: "2px solid #4f46e5",
                                    color: "#4f46e5",
                                    "&:hover": {
                                        bgcolor: "rgba(79,70,229,0.25)",
                                    },
                                },
                            }}
                        >
                            <Home sx={{ mr: 1 }} /> <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activePage === "documents"}
                            onClick={() => setActivePage("documents")}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    bgcolor: "rgba(19,168,152,0.15)",
                                    border: "2px solid #13a898",
                                    color: "#13a898",
                                    "&:hover": {
                                        bgcolor: "rgba(19,168,152,0.25)",
                                    },
                                },
                            }}
                        >
                            <Description sx={{ mr: 1 }} /> <ListItemText primary="Documents" />
                        </ListItemButton>
                    </ListItem>

                </List>
                <Box sx={{ flexGrow: 1 }} />
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate("/settings")}>
                            <Settings sx={{ mr: 1 }} /> <ListItemText primary="Settings" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} /> <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <AppBar
                    position="sticky"
                    sx={{
                        background: "linear-gradient(90deg, #13a898, #4f46e5)",
                        boxShadow: "none",
                    }}
                >
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Typography variant="h6">
                            {activePage === "home" ? "Home" : "Documents"}
                        </Typography>
                        <Box>
                            <IconButton onClick={handleMenu} color="inherit">
                                <Avatar sx={{ bgcolor: "#fff", color: "#4f46e5" }}>
                                    {initials}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => navigate("/settings")}>
                                    <Settings sx={{ mr: 1 }} /> Settings
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <Logout sx={{ mr: 1 }} /> Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container sx={{ py: 4 }}>
                    {activePage === "home" && (
                        <HomePage />
                    )}
                    {activePage === "documents" && (
                        <Documents />
                    )}
                </Container>

            </Box>
        </Box>
    );
}
