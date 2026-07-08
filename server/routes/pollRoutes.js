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
} from "../controllers/pollController.js";

const router = express.Router();

router.get("/", getPolls);
router.get("/active", getActivePoll);
router.get("/votes", getPollVotes);
router.post("/", createPoll);
router.put("/:id", updatePoll);
router.delete("/:id", deletePoll);
router.post("/:id/vote", votePoll);
router.get("/:id/check-vote", checkVote);

export default router;
