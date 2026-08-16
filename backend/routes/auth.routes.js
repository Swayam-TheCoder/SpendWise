import express from "express";
import { signupController, loginController, getMeController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", authenticate, getMeController);

export default router;