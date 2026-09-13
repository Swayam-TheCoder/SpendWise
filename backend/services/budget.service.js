import prisma from "../config/prisma.js";

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);

  const startDate = new Date(year, monthNumber - 1, 1);

  const endDate = new Date(year, monthNumber, 1);

  return {
    startDate,
    endDate,
  };
};

export const createBudget = async (userId, { categoryId, amount, month }) => {
  // Make sure category belongs to the user
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const { startDate } = getMonthRange(month);

  const existingBudget = await prisma.budget.findUnique({
    where: {
      userId_categoryId_month: {
        userId,
        categoryId,
        month: startDate,
      },
    },
  });

  if (existingBudget) {
    const error = new Error(
      "Budget already exists for this category and month",
    );

    error.statusCode = 409;
    throw error;
  }

  const createdBudget = await prisma.budget.create({
    data: {
      userId,
      categoryId,
      amount,
      month: startDate,
    },
    include: {
      category: true,
    },
  });

  return {
    ...createdBudget,
    amount: Number(createdBudget.amount),
  };
};

export const getBudgets = async (userId, month) => {
  const { startDate, endDate } = getMonthRange(month);

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: startDate,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const result = await Promise.all(
    budgets.map(async (budget) => {
      const spentResult = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const budgetAmount = Number(budget.amount);
      const spent = Number(spentResult._sum.amount || 0);

      const remaining = Math.max(budgetAmount - spent, 0);

      const percentage =
        budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      let status = "ON_TRACK";

      if (percentage >= 100) {
        status = "OVER_BUDGET";
      } else if (percentage >= 80) {
        status = "WARNING";
      }

      return {
        id: budget.id,
        category: budget.category,
        month: budget.month,
        budget: budgetAmount,
        spent,
        remaining,
        percentage,
        status,
      };
    }),
  );

  return result;
};

export const getBudget = async (userId, budgetId) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!budget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  const month = budget.month.toISOString().slice(0, 7);

  const { startDate, endDate } = getMonthRange(month);

  const spentResult = await prisma.expense.aggregate({
    where: {
      userId,
      categoryId: budget.categoryId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const budgetAmount = Number(budget.amount);
  const spent = Number(spentResult._sum.amount || 0);

  const percentage =
    budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

  return {
    id: budget.id,
    category: budget.category,
    month: budget.month,
    budget: budgetAmount,
    spent,
    remaining: Math.max(budgetAmount - spent, 0),
    percentage,
    status:
      percentage >= 100
        ? "OVER_BUDGET"
        : percentage >= 80
          ? "WARNING"
          : "ON_TRACK",
  };
};

export const updateBudget = async (userId, budgetId, { amount }) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      amount,
    },
    include: {
      category: true,
    },
  });
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.budget.delete({
    where: {
      id: budgetId,
    },
  });
};
