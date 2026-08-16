import argon2 from "argon2";
import prisma from "../config/prisma.js";

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