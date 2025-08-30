import { io } from "socket.io-client";
const token = localStorage.getItem("token");
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  auth: { token },
});

export default socket;
