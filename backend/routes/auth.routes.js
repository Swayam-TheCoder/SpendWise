import express from "express";
import { signupController, loginController, getMeController, refreshController, logoutController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", authenticate, getMeController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

export default router;