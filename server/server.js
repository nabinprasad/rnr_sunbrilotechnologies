import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import os from "os";

// Increase libuv thread pool size (default=4) for parallel MongoDB reads.
// This alone can triple throughput on read-heavy workloads.
const DESIRED_THREADS = process.env.UV_THREADPOOL_SIZE
  ? parseInt(process.env.UV_THREADPOOL_SIZE, 10)
  : Math.max(16, os.cpus().length * 4);
process.env.UV_THREADPOOL_SIZE = String(DESIRED_THREADS);

import connectDB from "./config/db.js";
import memoryCache from "./middleware/cache.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizSessionRoutes from "./routes/quizSessionRoutes.js";
import quizAnswerRoutes from "./routes/quizAnswerRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import tambolaRoutes from "./routes/tambolaRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";

import { startQuizTimer } from "./controllers/quizSessionController.js";
import { initPollAutoClose } from "./controllers/pollController.js";

import certificateRoutes from "./routes/certificateRoutes.js";
import awardRoutes from "./routes/awardRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Longer cache TTLs for hot-read endpoints — these change only when the
// admin clicks a button (so a 5-second TTL is perfectly fine).
const FIVE_SECONDS = 5 * 1000;
const TWO_SECONDS = 2 * 1000;
const ONE_SECOND = 1 * 1000;
const LONG_TTL_ROUTES = [
  "/api/event",
  "/api/tambola/session",
  "/api/quiz-session",
  "/api/awards",
  "/api/teams",
  "/api/quiz",
  "/api/certificates",
  "/api/employees/leaderboard",
];
const MED_TTL_ROUTES = ["/api/polls", "/api/employees"];

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  let ttl = ONE_SECOND;
  const url = req.originalUrl || req.url;
  if (LONG_TTL_ROUTES.some((r) => url.startsWith(r))) ttl = FIVE_SECONDS;
  else if (MED_TTL_ROUTES.some((r) => url.startsWith(r))) ttl = TWO_SECONDS;
  return memoryCache({ ttl })(req, res, next);
});

// ==========================
// Create HTTP Server
// ==========================
const server = http.createServer(app);

// ==========================
// Socket.IO
// ==========================
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize poll auto-close
initPollAutoClose(io);

export const getIO = () => io;

io.on("connection", (socket) => {
  // Employee joins personal room
  socket.on("joinEmployee", (employeeId) => {
    if (!employeeId) return;

    const room = `employee:${employeeId}`;
    socket.join(room);

    console.log(`Employee Joined Room: ${room}`);
  });

  // Admin joins room
  socket.on("joinAdmin", () => {
    socket.join("admins");

    console.log("Admin Connected");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected:", socket.id);
  });
});

// ==========================
// Start Quiz Timer
// ==========================
startQuizTimer();

// ==========================
// Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quiz-session", quizSessionRoutes);
app.use("/api/quiz-answer", quizAnswerRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/tambola", tambolaRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/awards", awardRoutes);

// ==========================
// Health Check
// ==========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Reward Recognition API Running 🚀",
  });
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



// ==========================
// Start Certificate
// ==========================
app.use("/api/certificates", certificateRoutes);