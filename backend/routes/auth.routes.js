import express from "express";

import {
  signupController,
  loginController,
  refreshController,
  logoutController,
  getMeController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
} from "../controllers/auth.controller.js";

import { authenticate, resetPasswordController } from "../middleware/auth.middleware.js";

import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/signup", authRateLimiter, signupController);

router.post("/login", authRateLimiter, loginController);

router.post("/refresh", authRateLimiter, refreshController);

router.post("/logout", logoutController);

router.get("/me", authenticate, getMeController);

router.post("/verify-email",authRateLimiter, verifyEmailController);

router.post("/resend-verification", authRateLimiter, resendVerificationController);

router.post("/forgot-password", authRateLimiter, forgotPasswordController);

router.post("/reset-password", authRateLimiter, resetPasswordController);

export default router;