import prisma from "../config/prisma.js";

export const createExpense = async ({
  userId,
  amount,
  description,
  categoryId,
  paymentMethod,
  date,
}) => {
  // Make sure the category belongs to the logged-in user
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    const error = new Error("Invalid category");
    error.code = "CATEGORY_NOT_FOUND";
    throw error;
  }

  return prisma.expense.create({
    data: {
      userId,
      categoryId,
      amount,
      description,
      paymentMethod,
      date: date ? new Date(date) : new Date(),
    },
    include: {
      categoryRef: true,
    },
  });
};

export const getExpenses = async (userId) => {
  return prisma.expense.findMany({
    where: {
      userId,
    },
    include: {
      categoryRef: true,
    },
    orderBy: {
      date: "desc",
    },
  });
};

export const getExpenseById = async (userId, expenseId) => {
  return prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
    include: {
      categoryRef: true,
    },
  });
};

export const updateExpense = async (
  userId,
  expenseId,
  data,
) => {
  // If category is being changed, verify ownership
  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
      },
    });

    if (!category) {
      const error = new Error("Invalid category");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }
  }

  return prisma.expense.updateMany({
    where: {
      id: expenseId,
      userId,
    },
    data,
  });
};

export const deleteExpense = async (
  userId,
  expenseId,
) => {
  return prisma.expense.deleteMany({
    where: {
      id: expenseId,
      userId,
    },
  });
};