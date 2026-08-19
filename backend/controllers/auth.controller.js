import { signupSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, forgotPasswordSchema, changePasswordSchema } from "../validators/auth.validator.js";
import { signup, login, refreshSession, logout, verifyEmail, resendVerificationEmail, forgotPassword, changePassword } from "../services/auth.service.js";
import prisma from "../config/prisma.js";


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

export const loginController = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await login(data);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
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
    const refreshToken = req.cookies.refreshToken;

    const result = await refreshSession(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
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
    const { email } =
      resendVerificationSchema.parse(req.body);

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

    if (
      error.message ===
      "Password authentication is not available"
    ) {
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