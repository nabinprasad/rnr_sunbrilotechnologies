import express from "express";
import {
  submitAnswer,
  resetQuizAnswers,
  resetEmployeeAnswers,
  getQuizAnswers,
} from "../controllers/quizAnswerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getQuizAnswers);
router.post("/submit", submitAnswer);

// Admin only
router.delete("/reset", protect, resetQuizAnswers);
router.delete("/reset-employee/:employeeId", protect, resetEmployeeAnswers);

export default router;