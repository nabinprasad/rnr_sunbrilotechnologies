import express from "express";
import {
  getAwards,
  createAward,
  updateAward,
  assignWinner,
  assignNominees,
  deleteAward,
} from "../controllers/awardController.js";

const router = express.Router();

router.get("/", getAwards);
router.post("/", createAward);
router.put("/:id", updateAward);
router.post("/:id/assign", assignWinner);
router.post("/:id/nominees", assignNominees);
router.delete("/:id", deleteAward);

export default router;
