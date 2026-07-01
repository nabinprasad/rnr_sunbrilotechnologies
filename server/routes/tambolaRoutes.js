import express from "express";
import {
  getSession,
  startSession,
  callNextNumber,
  endSession,
  resetSession,
  getTicket,
  getAllTickets,
  submitClaim,
  getClaims,
  reviewClaim,
} from "../controllers/tambolaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/session", getSession);
router.post("/session/start", protect, startSession);
router.post("/session/call", protect, callNextNumber);
router.post("/session/end", protect, endSession);
router.post("/session/reset", protect, resetSession);

router.get("/ticket/:employeeId", getTicket);
router.get("/tickets", protect, getAllTickets);

router.post("/claim", submitClaim);
router.get("/claims", protect, getClaims);
router.put("/claims/:claimId", protect, reviewClaim);

export default router;
