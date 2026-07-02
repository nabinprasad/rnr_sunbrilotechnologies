import express from "express";
import {
    getCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateById,
} from "../controllers/certificateController.js";

const router = express.Router();

router.get("/", getCertificates);
router.get("/:id", getCertificateById);
router.post("/", createCertificate);
router.put("/:id", updateCertificate);
router.delete("/:id", deleteCertificate);

export default router;