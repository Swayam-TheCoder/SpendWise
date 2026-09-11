import prisma from "../config/prisma.js";

export const createCategory = async ({
  userId,
  name,
  icon,
  color,
}) => {
  return prisma.category.create({
    data: {
      userId,
      name,
      icon,
      color,
    },
  });
};

export const getCategories = async (userId) => {
  return prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getCategoryById = async (userId, categoryId) => {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
};

export const updateCategory = async (
  userId,
  categoryId,
  data,
) => {
  return prisma.category.updateMany({
    where: {
      id: categoryId,
      userId,
    },
    data,
  });
};

export const deleteCategory = async (
  userId,
  categoryId,
) => {
  return prisma.category.deleteMany({
    where: {
      id: categoryId,
      userId,
    },
  });
};