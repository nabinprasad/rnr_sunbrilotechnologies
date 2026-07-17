import express from "express";
import {
  getAwards,
  createAward,
  updateAward,
  assignWinner,
  assignNominees,
  deleteAward,
} from "../controllers/awardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAwards);
router.post("/", protect, createAward);
router.put("/:id", protect, updateAward);
router.post("/:id/assign", protect, assignWinner);
router.post("/:id/nominees", protect, assignNominees);
router.delete("/:id", protect, deleteAward);

export default router;
