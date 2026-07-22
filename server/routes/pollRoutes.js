import express from "express";
import {
  getPolls,
  getActivePoll,
  createPoll,
  updatePoll,
  deletePoll,
  votePoll,
  checkVote,
  getPollVotes,
  clearPollVotes,
} from "../controllers/pollController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPolls);
router.get("/active", getActivePoll);
router.get("/votes", getPollVotes);
router.post("/", protect, createPoll);
router.put("/:id", protect, updatePoll);
router.delete("/:id", protect, deletePoll);
router.put("/:id/clear-votes", protect, clearPollVotes);
router.post("/:id/vote", votePoll);
router.get("/:id/check-vote", checkVote);

export default router;
