import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fabric } from "fabric";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  Popover,
  Typography,
  AppBar,
  Avatar,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import PanToolAltIcon from "@mui/icons-material/PanToolAlt";
import ImageIcon from "@mui/icons-material/Image";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import SaveIcon from "@mui/icons-material/Save";
import PaletteIcon from "@mui/icons-material/Palette";
import SyncIcon from "@mui/icons-material/Sync";
import DeleteIcon from "@mui/icons-material/Delete";
import io from "socket.io-client";
import api from "../services/api";
import { Settings, Logout, ArrowBack } from "@mui/icons-material";
import type { User } from "./Dashboard";
import type { Board } from "./Documents";

const socket = io();

const MAX_ZOOM = 4;
const MIN_ZOOM = 0.25;

type ToolMode = "draw" | "pan" | "eraser" | "shape";

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const [mode, setMode] = useState<ToolMode>("draw");
  const [brushColor, setBrushColor] = useState("#4f46e5");
  const [brushSize, setBrushSize] = useState(4);
  const [brushAnchor, setBrushAnchor] = useState<HTMLElement | null>(null);
  const openBrush = Boolean(brushAnchor);

  // Initialize canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const el = document.createElement("canvas");
    el.width = containerRef.current.clientWidth;
    el.height = containerRef.current.clientHeight;
    el.id = "my-canvas";
    containerRef.current.appendChild(el);

    const canvas = new fabric.Canvas("my-canvas", {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: "#f0f0f0",
      selection: true,
    });
    canvasRef.current = canvas;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    // Mouse wheel zoom
    canvas.on("mouse:wheel", (opt: any) => {
      const e = opt.e as WheelEvent;
      let zoom = canvas.getZoom();
      zoom *= e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
      const pointer = canvas.getPointer(e);
      canvas.zoomToPoint(pointer, zoom);
      e.preventDefault();
      e.stopPropagation();
    });

    // Pan mode
    let isPanning = false;
    canvas.on("mouse:down", () => {
      if (mode === "pan") {
        isPanning = true;
        canvas.setCursor("grabbing");
      }
    });
    canvas.on("mouse:move", (opt: any) => {
      if (!isPanning) return;
      const e = opt.e as MouseEvent;
      canvas.relativePan(new fabric.Point(e.movementX, e.movementY));
    });
    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.setCursor("default");
    });

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      canvas.setWidth(containerRef.current.clientWidth);
      canvas.setHeight(containerRef.current.clientHeight);
      canvas.renderAll();
    };
    window.addEventListener("resize", onResize);

    setCanvasReady(true);

    return () => {
      window.removeEventListener("resize", onResize);
      if (canvasRef.current) {
        try {
          canvasRef.current.clear();
          canvasRef.current.dispose();
        } catch (e) {
          console.warn("Dispose error:", e);
        }
        canvasRef.current = null;
      }
    };
  }, []);

  // Drawing mode & cursors
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    c.isDrawingMode = mode === "draw" || mode === "eraser";
    if (c.freeDrawingBrush) {
      (c.freeDrawingBrush as fabric.PencilBrush).color =
        mode === "eraser" ? "#ffffff" : brushColor;
      (c.freeDrawingBrush as fabric.PencilBrush).width = brushSize;
    }

    if (mode === "draw") {
      c.freeDrawingCursor = "url('/icons/pencil-cursor.png') 0 24, crosshair";
    } else if (mode === "eraser") {
      c.freeDrawingCursor = "url('/icons/eraser-cursor.png') 0 24, crosshair";
    } else if (mode === "pan") {
      c.defaultCursor = "grab";
    } else {
      c.defaultCursor = "default";
    }
  }, [mode, brushColor, brushSize]);

  // Load board data from backend
  useEffect(() => {
    if (!id || !canvasReady) return;

    const load = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        const board = res.data;
        const c = canvasRef.current!;
        c.clear();

        if (board?.elements) {
          const data =
            Array.isArray(board.elements) && board.elements.length > 0
              ? board.elements[0]
              : board.elements;

          c.loadFromJSON(data, () => {
            c.renderAll();
          });
        }
      } catch (e) {
        console.error("Failed to load board", e);
      }
    };

    load();

    socket.emit("join-board", id);

    const onRemote = (payload: any) => {
      const c = canvasRef.current;
      if (!c) return;
      c.loadFromJSON(payload.json, () => c.renderAll());
    };
    socket.on("canvas:update", onRemote);

    return () => {
      socket.emit("leave-board", id);
      socket.off("canvas:update", onRemote);
    };
  }, [id, canvasReady]);

  // Emit updates
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let t: any;
    const emit = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const json = c.toJSON(["selectable", "id", "name"]);
        socket.emit("canvas:update", { boardId: id, payload: { json } });
      }, 250);
    };
    c.on("object:added", emit);
    c.on("object:modified", emit);
    c.on("object:removed", emit);
    c.on("path:created", emit);
    return () => {
      c.off("object:added", emit);
      c.off("object:modified", emit);
      c.off("object:removed", emit);
      c.off("path:created", emit);
    };
  }, [id, canvasReady]);

  // Upload image
  const addImage = async (file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post(`/boards/${id}/snapshot`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      let { url } = res.data;
      if (!url) return alert("Upload failed");
      if (!url.startsWith("http")) url = `http://localhost:4000${url}`;

      const c = canvasRef.current!;
      fabric.Image.fromURL(url, (img) => {
        if (!img) return;
        const max = Math.min(c.getWidth(), c.getHeight()) * 0.6;
        const scale = Math.min(
          1,
          max / Math.max(img.width ?? max, img.height ?? max)
        );
        img.scale(scale);
        img.left = (c.getWidth() - img.width! * scale) / 2;
        img.top = (c.getHeight() - img.height! * scale) / 2;
        c.add(img);
        c.setActiveObject(img);
        c.renderAll();
      });
    } catch (e) {
      console.error("Image upload failed:", e);
      alert("Upload failed");
    }
  };

  const saveCanvas = async () => {
    const c = canvasRef.current;
    if (!c) return;

    try {
      const json = c.toJSON([
        "selectable",
        "id",
        "name",
        "src", // keep image URL
      ]);

      await api.put(`/boards/${id}`, { elements: [json] });
      alert("Saved!");
    } catch (e) {
      console.error(e);
      alert("Save failed!");
    }
  };

  const handleClear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getObjects().forEach((obj) => {
      if (obj.type !== "rect") c.remove(obj);
    });
  };

  const tooltipSx = {
    bgcolor: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: 2,
    boxShadow: 3,
    fontSize: 14,
    px: 1,
    py: 0.5,
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [boards, setBoards] = useState<Board[]>([]);

  const sortBoards = (list: Board[]) =>
    [...list].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  useEffect(() => {
    api.get("/boards").then((res) => setBoards(sortBoards(res.data)));
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const currentBoard = boards.find((b) => b._id === id);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Navbar */}
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(90deg, #13a898, #4f46e5)",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {currentBoard && (
              <IconButton
                onClick={() =>
                  navigate("/dashboard", { state: { activePage: "documents" } })
                }
                edge="start"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Typography variant="h6">
              {currentBoard ? currentBoard.title : "Documents"}
            </Typography>
          </Box>
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
      <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#ececec",
            p: 1,
            borderRadius: 2,
            m: 1,
          }}
        >
          <Tooltip
            title="Draw"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton onClick={() => setMode("draw")}>
              <BrushIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Brush Settings"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton onClick={(e) => setBrushAnchor(e.currentTarget)}>
              <PaletteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Pan" componentsProps={{ tooltip: { sx: tooltipSx } }}>
            <IconButton onClick={() => setMode("pan")}>
              <PanToolAltIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Eraser"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton onClick={() => setMode("eraser")}>
              <SyncIcon />
            </IconButton>
          </Tooltip>

          <Divider sx={{ my: 1, width: "100%" }} />

          <Tooltip
            title="Add Image"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton component="label">
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) addImage(e.target.files[0]);
                }}
              />
              <ImageIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Zoom In"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton
              onClick={() => {
                const c = canvasRef.current;
                if (!c) return;
                const zoom = Math.min(MAX_ZOOM, c.getZoom() * 1.2);
                c.zoomToPoint(
                  new fabric.Point(c.getWidth() / 2, c.getHeight() / 2),
                  zoom
                );
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Zoom Out"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton
              onClick={() => {
                const c = canvasRef.current;
                if (!c) return;
                const zoom = Math.max(MIN_ZOOM, c.getZoom() / 1.2);
                c.zoomToPoint(
                  new fabric.Point(c.getWidth() / 2, c.getHeight() / 2),
                  zoom
                );
              }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Fit Screen"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton
              onClick={() => {
                const c = canvasRef.current;
                if (!c) return;
                c.setViewportTransform([1, 0, 0, 1, 0, 0]);
                c.setZoom(1);
              }}
            >
              <FitScreenIcon />
            </IconButton>
          </Tooltip>

          <Divider sx={{ my: 1, width: "100%" }} />

          <Tooltip
            title="Clear"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton onClick={handleClear}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Save"
            componentsProps={{ tooltip: { sx: tooltipSx } }}
          >
            <IconButton onClick={saveCanvas}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Brush Popover */}
        <Popover
          open={openBrush}
          anchorEl={brushAnchor}
          onClose={() => setBrushAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 2, width: 200 }}>
            <Typography variant="subtitle2">Brush Size</Typography>
            <Slider
              value={brushSize}
              min={1}
              max={50}
              onChange={(_, v) => setBrushSize(v as number)}
            />
            <Typography variant="subtitle2">Brush Color</Typography>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                border: "none",
                cursor: "pointer",
              }}
            />
          </Box>
        </Popover>

        {/* Canvas */}
        <Box ref={containerRef} sx={{ flexGrow: 1, position: "relative" }} />
      </Box>
    </Box>
  );
}
