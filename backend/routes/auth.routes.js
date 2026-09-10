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
  changePasswordController,
  getSessionsController,
  revokeSessionController,
  logoutAllController,
  googleCallbackController,
  deleteAccountController,
} from "../controllers/auth.controller.js";

import {
  authenticate,
  resetPasswordController,
} from "../middleware/auth.middleware.js";

import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

import passport from "../config/passport.js";

const router = express.Router();

router.post("/signup", authRateLimiter, signupController);

router.post("/login", authRateLimiter, loginController);

router.post("/refresh", authRateLimiter, refreshController);

router.post("/logout", logoutController);

router.get("/me", authenticate, getMeController);

router.post("/verify-email", authRateLimiter, verifyEmailController);

router.post(
  "/resend-verification",
  authRateLimiter,
  resendVerificationController,
);

router.post("/forgot-password", authRateLimiter, forgotPasswordController);

router.post("/reset-password", authRateLimiter, resetPasswordController);

router.post(
  "/change-password",
  authenticate,
  authRateLimiter,
  changePasswordController,
);

router.get("/sessions", authenticate, getSessionsController);

router.delete("/sessions/:sessionId", authenticate, revokeSessionController);

router.post("/logout-all", authenticate, logoutAllController);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  googleCallbackController,
);

router.delete("/account", authenticate, deleteAccountController);

export default router;
