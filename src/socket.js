import { io } from "socket.io-client";

const socketUrl = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://rnrapi-test.sunbrilotechnologies.com";
   



console.log("🔌 Connecting to socket at:", socketUrl);

const socket = io(socketUrl, {
  transports: ["polling", "websocket"],
});

export default socket;