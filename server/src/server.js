import http from "http";
import app from "./app.js";
import { Server as IOServer } from "socket.io";

const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app);

// const io = new IOServer(httpServer, {
//   cors: {
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join-board", (boardId) => {
    const room = `board:${boardId}`;
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on("canvas:update", ({ boardId, payload }) => {
    socket.to(`board:${boardId}`).emit("canvas:update", payload);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(
    `✅ Public URL: ${process.env.PUBLIC_URL || "check Railway dashboard"}`
  );
});
