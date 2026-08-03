import mongoose from "mongoose";
import Event from "../models/Event.js";
import Employee from "../models/Employee.js";
import Award from "../models/Award.js";
import Quiz from "../models/Quiz.js";
import QuizSession from "../models/QuizSession.js";
import Poll from "../models/Poll.js";
import TambolaTicket from "../models/TambolaTicket.js";
import Certificate from "../models/Certificate.js";
import Team from "../models/Team.js";

const ensureIndexes = async () => {
  try {
    // Employee — queried in leaderboard, lookup, auth
    await Employee.collection.createIndex({ employeeId: 1 }, { unique: true, sparse: true });
    await Employee.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await Employee.collection.createIndex({ points: -1 });
    await Employee.collection.createIndex({ department: 1 });
    await Employee.collection.createIndex({ team: 1 });

    // Event — only one 'active' event at a time
    await Event.collection.createIndex({ createdAt: -1 });
    await Event.collection.createIndex({ status: 1 });

    // Awards — list + event linkage
    await Award.collection.createIndex({ createdAt: -1 });
    await Award.collection.createIndex({ event: 1 });

    // Quiz & QuizSession — latest session lookup
    await Quiz.collection.createIndex({ createdAt: -1 });
    await Quiz.collection.createIndex({ event: 1 });
    await QuizSession.collection.createIndex({ createdAt: -1 });
    await QuizSession.collection.createIndex({ status: 1 });
    await QuizSession.collection.createIndex({ quizId: 1 });

    // Polls
    await Poll.collection.createIndex({ createdAt: -1 });
    await Poll.collection.createIndex({ event: 1 });
    await Poll.collection.createIndex({ status: 1 });

    // Tambola — ticket by employeeId, session lookup
    await TambolaTicket.collection.createIndex({ employeeId: 1 });
    await TambolaTicket.collection.createIndex({ claimed: 1 });
    await TambolaTicket.collection.createIndex({ createdAt: -1 });

    // Certificates
    await Certificate.collection.createIndex({ employee: 1 });
    await Certificate.collection.createIndex({ awardId: 1 });
    await Certificate.collection.createIndex({ createdAt: -1 });

    // Teams
    await Team.collection.createIndex({ name: 1 }, { unique: true, sparse: true });
    await Team.collection.createIndex({ createdAt: -1 });

    console.log("✅ MongoDB indexes ensured");
  } catch (err) {
    console.warn("⚠️  Index creation note (safe to ignore on first run):", err.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 200, // Increase pool size for heavy load
      minPoolSize: 10,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");

    // Build indexes in the background after connection
    setImmediate(ensureIndexes);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;