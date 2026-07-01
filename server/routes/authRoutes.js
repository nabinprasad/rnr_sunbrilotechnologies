import express from "express";
import {
  registerAdmin,
  loginAdmin,
} from "../controllers/authController.js";

const router = express.Router();


router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Routes Working ✅",
  });
});


router.post("/register", registerAdmin);

router.post("/login", loginAdmin);


export default router;