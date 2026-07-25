import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

const socket = io(socketUrl, {
  transports: ["polling", "websocket"],
});

export default socket;
