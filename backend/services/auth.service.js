import argon2 from "argon2";
import prisma from "../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  hashToken,
} from "../utils/token.js";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.service.js";

export const signup = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      authProvider: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  const verificationToken = generateVerificationToken();
  //  /verify-email?token=${verificationToken}, its a verification token not the hashed token.

  const tokenHash = hashToken(verificationToken);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(
        Date.now() + 15 * 60 * 1000 // 15 minutes
      ),
    },
  });

  await sendVerificationEmail({
    email: user.email,
    token: verificationToken,
  });

  return user;
};


export const login = async ({ email, password, userAgent, ipAddress }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account is disabled");
  }

  if (!user.password) {
    throw new Error("Please use your social login provider");
  }

  const isPasswordValid = await argon2.verify(
    user.password,
    password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
    sessionId: session.id,
  };
};


export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const oldTokenHash = hashToken(refreshToken);

  const oldSession = await prisma.session.findFirst({
    where: {
      userId: decoded.userId,
      refreshTokenHash: oldTokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!oldSession) {
    throw new Error("Invalid refresh session");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not available");
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  const newRefreshTokenHash = hashToken(newRefreshToken);

  const newExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  // Rotate the session
  await prisma.$transaction([
    prisma.session.delete({
      where: {
        id: oldSession.id,
      },
    }),

    prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const refreshTokenHash = hashToken(refreshToken);

  await prisma.session.deleteMany({
    where: {
      refreshTokenHash,
    },
  });
};


export const verifyEmail = async (token) => {
  if (!token) {
    throw new Error("Verification token is required");
  }

  const tokenHash = hashToken(token);

  const verificationToken =
    await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

  if (!verificationToken) {
    throw new Error("Invalid verification token");
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    throw new Error("Verification token has expired");
  }

  if (verificationToken.user.isEmailVerified) {
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        isEmailVerified: true,
      },
    }),

    prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    }),
  ]);
};

export const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Dont reveal whether an email exists
  if (!user) {
    return;
  }

  if (user.isEmailVerified) {
    return;
  }

  const verificationToken = generateVerificationToken();
  const tokenHash = hashToken(verificationToken);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(
        Date.now() + 15 * 60 * 1000
      ),
    },
  });

  await sendVerificationEmail({
    email: user.email,
    token: verificationToken,
  });
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Don't reveal whether the email exists.
  if (!user) {
    return;
  }

  if (!user.password) {
    return;
  }

  const resetToken = generateVerificationToken();
  console.log("Reset Token:", resetToken); // Log the reset token for debugging // logs

  const tokenHash = hashToken(resetToken);

  // Remove old reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(
        Date.now() + 15 * 60 * 1000
      ),
    },
  });

  await sendPasswordResetEmail({
    email: user.email,
    token: resetToken,
  });
};


export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });
  
  console.log("Reset Token:", resetToken); // Log the reset token for debugging //logs

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await argon2.hash(password);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashedPassword,
        authProvider: "LOCAL",
      },
    }),

    // Invalidate all existing login sessions
    prisma.session.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    }),

    // Make reset token one-time-use
    prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    }),
  ]);
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("Password authentication is not available");
  }

  const isValid = await argon2.verify(
    user.password,
    currentPassword
  );

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await argon2.hash(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    }),

    // Invalidate existing sessions
    prisma.session.deleteMany({
      where: {
        userId,
      },
    }),
  ]);
};

export const getUserSessions = async (userId) => {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const revokeSession = async (userId, sessionId) => {
  const result = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Session not found");
  }
};