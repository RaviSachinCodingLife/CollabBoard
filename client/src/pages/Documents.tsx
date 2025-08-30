import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Check,
  Close,
  WarningAmberRounded,
  MoreVert,
} from "@mui/icons-material";
import api from "../services/api";
import CanvaPreview from "../utils/CanvaPreview";
import Board from "./Board";

export type Board = {
  _id: string;
  title: string;
  updatedAt: string;
  elements?: any[];
};

export default function Documents() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBoardId, setMenuBoardId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const sortBoards = (list: Board[]) =>
    [...list].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  useEffect(() => {
    api.get("/boards").then((res) => setBoards(sortBoards(res.data)));
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const createBoard = async () => {
    try {
      const res = await api.post(
        "/boards",
        { title: "Untitled Board" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBoards((s) => sortBoards([res.data, ...s]));
      navigate(`/board/${res.data._id}`);
      console.log({ deleteId, id: res.data._id });
    } catch (err: any) {
      console.error("Failed to create board:", err);
      alert(
        "Could not create board: " + (err.response?.data?.msg || err.message)
      );
    }
  };

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setNewTitle(title);
    handleCloseMenu();
  };

  const confirmRename = async (id: string) => {
    if (!newTitle.trim()) return;
    const res = await api.put(`/boards/${id}`, { title: newTitle.trim() });
    setBoards((s) =>
      sortBoards(
        s.map((b) =>
          b._id === id
            ? { ...b, title: res.data.title, updatedAt: res.data.updatedAt }
            : b
        )
      )
    );
    setEditingId(null);
    setNewTitle("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setNewTitle("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/boards/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBoards((s) => s.filter((b) => b._id !== deleteId));
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Delete failed: " + (err.response?.data?.msg || err.message));
    }
    setDeleteId(null);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    id: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuBoardId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuBoardId(null);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return (
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        Recent Documents
      </Typography>

      <Grid container spacing={4}>
        {/* Create New Board */}
        <Grid size={{ xs: 6, sm: 4, md: 3, xl: 2.4 }}>
          <Paper
            sx={{
              width: 220,
              height: 220,
              borderRadius: 4,
              background: "linear-gradient(135deg, #13a898, #4f46e5)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              transition: "transform 0.25s, box-shadow 0.25s",
              "&:hover": {
                transform: "translateY(-6px) scale(1.02)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              },
            }}
            onClick={createBoard}
          >
            <Add sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              New Document
            </Typography>
          </Paper>
        </Grid>

        {/* List boards */}
        {boards.map((b) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, xl: 2.4 }} key={b._id}>
            <Paper
              sx={{
                width: 220,
                height: 220,
                borderRadius: 4,
                bgcolor: "#fff",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transition: "transform 0.25s, box-shadow 0.25s",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                },
              }}
              onClick={() => navigate(`/board/${b._id}`)}
            >
              {/* ✅ Canvas Preview */}
              {b.elements && b.elements.length > 0 ? (
                <CanvaPreview board={b.elements} />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  No Preview
                </Box>
              )}

              {/* 3-dot menu */}
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "white",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuClick(e, b._id);
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Paper>

            {/* Title */}
            {editingId === b._id ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 1,
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  inputRef={inputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  sx={{
                    maxWidth: 140,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 14,
                    },
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename(b._id);
                    if (e.key === "Escape") cancelRename();
                  }}
                />
                <IconButton size="small" onClick={() => confirmRename(b._id)}>
                  <Check fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={cancelRename}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", mt: 1.5 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  fontSize={15}
                  color="#333"
                >
                  {b.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  Last edited {formatDate(b.updatedAt)}
                </Typography>
              </Box>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() =>
            menuBoardId &&
            startEditing(
              menuBoardId,
              boards.find((b) => b._id === menuBoardId)?.title || ""
            )
          }
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuBoardId) setDeleteId(menuBoardId);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        TransitionComponent={Slide}
      >
        <DialogTitle>
          <WarningAmberRounded color="error" /> Delete Document
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this document? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
