import express from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  joinEmployee,
  resetEmployeePoints,
  getEmployeeStatus,
  getLeaderboard,
  importEmployees,
  exportEmployees,
} from "../controllers/employeeController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public route
router.post("/join", joinEmployee);

// Protected routes
router.get("/", protect, getEmployees);
router.get("/leaderboard", getLeaderboard);
router.get("/export", protect, exportEmployees);
router.get("/:id", protect, getEmployee);

router.post(
  "/",
  protect,
  upload.single("photoFile"),
  createEmployee
);

router.post(
  "/import",
  protect,
  upload.single("file"),
  importEmployees
);

router.put("/approve/:id", protect, approveEmployee);
router.get("/status/:id", getEmployeeStatus);
router.put("/reset-points", protect, resetEmployeePoints);

router.put(
  "/:id",
  protect,
  upload.single("photoFile"),
  updateEmployee
);
router.delete("/:id", protect, deleteEmployee);

export default router;
