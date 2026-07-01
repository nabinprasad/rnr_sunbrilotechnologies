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
} from "../controllers/employeeController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/join", joinEmployee);

// Protected routes
router.get("/", protect, getEmployees);
router.get("/:id", protect, getEmployee);

router.post("/", protect, createEmployee);

router.put("/approve/:id", protect, approveEmployee);
router.get("/status/:id", getEmployeeStatus);
router.put("/reset-points", protect, resetEmployeePoints); // <-- Add here

router.put("/:id", protect, updateEmployee);

router.delete("/:id", protect, deleteEmployee);

export default router;