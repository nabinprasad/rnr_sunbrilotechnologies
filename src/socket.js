import { io } from "socket.io-client";

const socket = io("https://rnrapi-test.sunbrilotechnologies.com");

export default socket;