import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizSessionRoutes from "./routes/quizSessionRoutes.js";
import quizAnswerRoutes from "./routes/quizAnswerRoutes.js";

import { startQuizTimer } from "./controllers/quizSessionController.js";

import certificateRoutes from "./routes/certificateRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

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
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket Connected:", socket.id);

  // Employee joins personal room
  socket.on("joinEmployee", (employeeId) => {
    socket.join(employeeId);

    console.log(`Employee Joined Room: ${employeeId}`);
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
app.use("/api/employees", employeeRoutes);

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