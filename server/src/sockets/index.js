const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const boardHandler = require("./boardSocket");

let io;

function initSockets(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split?.(" ")[1];
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      return next();
    } catch (err) {
      return next(new Error("Auth error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id, "userId=", socket.user?.id);
    boardHandler(io, socket);
  });
}

module.exports = { initSockets };
