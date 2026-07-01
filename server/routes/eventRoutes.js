import express from "express";
import {
  getEvent,
  updateEvent,
} from "../controllers/eventController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getEvent);

router.put("/", protect, updateEvent);

export default router;