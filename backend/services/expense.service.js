import prisma from "../config/prisma.js";

export const createExpense = async ({
  userId,
  amount,
  description,
  category,
  paymentMethod,
  date,
}) => {
  return prisma.expense.create({
    data: {
      userId,
      amount,
      description,
      category,
      paymentMethod,
      date: date ? new Date(date) : new Date(),
    },
  });
};

export const getExpenses = async (userId) => {
  return prisma.expense.findMany({
    where: {
      userId,
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
  });
};

export const updateExpense = async (
  userId,
  expenseId,
  data,
) => {
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