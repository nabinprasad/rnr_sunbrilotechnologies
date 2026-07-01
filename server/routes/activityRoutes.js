import express from "express";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", getActivities);

router.post("/", protect, createActivity);

router.put("/:id", protect, updateActivity);

router.delete("/:id", protect, deleteActivity);

export default router;