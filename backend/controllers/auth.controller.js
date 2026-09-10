import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";
import {
  signup,
  login,
  refreshSession,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  changePassword,
  getUserSessions,
  revokeSession,
  logoutAllSessions,
} from "../services/auth.service.js";
import prisma from "../config/prisma.js";

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

import argon2 from "argon2";

export const signupController = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    const user = await signup(data);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error.message === "Email is already registered") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await login({
      ...data,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",

      user: result.user,

      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (
      error.message === "Invalid email or password" ||
      error.message === "Account is disabled" ||
      error.message === "Please use your social login provider"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMeController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        authProvider: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshController = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await refreshSession(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error.message === "Refresh token reuse detected") {
      res.clearCookie("refreshToken");

      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected. Please login again.",
      });
    }

    if (
      error.message === "Invalid refresh token" ||
      error.message === "Session not found" ||
      error.message === "Session expired"
    ) {
      res.clearCookie("refreshToken");

      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Refresh error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to refresh session",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await logout(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    await verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request",
        errors: error.issues,
      });
    }

    if (
      error.message === "Invalid verification token" ||
      error.message === "Verification token has expired"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const { email } = resendVerificationSchema.parse(req.body);

    await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message:
        "If the account exists and is not verified, a verification email has been sent.",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        errors: error.issues,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to send verification email",
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    await forgotPassword(email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        errors: error.issues,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    await changePassword({
      userId: req.userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: error.issues,
      });
    }

    if (error.message === "Current password is incorrect") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Password authentication is not available") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

export const getSessionsController = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch sessions",
    });
  }
};

export const revokeSessionController = async (req, res) => {
  try {
    await revokeSession(req.userId, req.params.sessionId);

    return res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    if (error.message === "Session not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to revoke session",
    });
  }
};

export const logoutAllController = async (req, res) => {
  try {
    await logoutAllSessions(req.userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout from all devices",
    });
  }
};

export const googleCallbackController = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
      );
    }

    const accessToken = generateAccessToken(user.id);

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: "temporary",
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshTokenHash = await argon2.hash(refreshToken);

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash,
      },
    });

    // Store refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Don't put access token in URL
    return res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    );
  }
};

export const deleteAccountController = async (req, res) => {
  try {
    await prisma.session.deleteMany({
      where: {
        userId: req.userId,
      },
    });

    await prisma.user.delete({
      where: {
        id: req.userId,
      },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete account",
    });
  }
};