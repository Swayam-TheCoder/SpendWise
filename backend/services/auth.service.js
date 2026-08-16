import argon2 from "argon2";
import prisma from "../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";

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

  return user;
};


export const login = async ({ email, password }) => {
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