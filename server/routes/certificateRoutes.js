import express from "express";
import {
    getCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateById,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCertificates);
router.get("/:id", getCertificateById);
router.post("/", protect, createCertificate);
router.put("/:id", protect, updateCertificate);
router.delete("/:id", protect, deleteCertificate);

export default router;