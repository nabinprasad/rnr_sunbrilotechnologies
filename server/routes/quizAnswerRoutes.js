import express from "express";
import {
  submitAnswer,
  resetQuizAnswers,
} from "../controllers/quizAnswerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/submit", submitAnswer);

// Admin only
router.delete("/reset", protect, resetQuizAnswers);

export default router;