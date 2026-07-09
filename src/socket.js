import { io } from "socket.io-client";

const socketUrl = import.meta.env.DEV

  ? "https://rnrapi-test.sunbrilotechnologies.com"
  : "http://localhost:5000";

console.log("🔌 Connecting to socket at:", socketUrl);

const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
});

export default socket;