import prisma from "../config/prisma.js";

export const getDashboardSummary = async (userId, month) => {
  const now = new Date();

  let startDate;
  let endDate;

  if (month) {
    const [year, monthNumber] = month.split("-").map(Number);

    startDate = new Date(year, monthNumber - 1, 1);
    endDate = new Date(year, monthNumber, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const isCurrentMonth =
    startDate.getFullYear() === now.getFullYear() &&
    startDate.getMonth() === now.getMonth();

  const [
    totalSpentResult,
    monthlySpentResult,
    todaySpentResult,
    transactionCount,
  ] = await prisma.$transaction([
    prisma.expense.aggregate({
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startOfToday,
          lt: now,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.count({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),
  ]);

  return {
    totalSpent: Number(totalSpentResult._sum.amount || 0),

    thisMonth: Number(
      monthlySpentResult._sum.amount || 0,
    ),

    today: isCurrentMonth
      ? Number(todaySpentResult._sum.amount || 0)
      : 0,

    transactionCount,
  };
};

export const getCategoryBreakdown = async (userId, month) => {
  const now = new Date();

  let startDate;
  let endDate;

  if (month) {
    const [year, monthNumber] = month.split("-").map(Number);

    startDate = new Date(year, monthNumber - 1, 1);
    endDate = new Date(year, monthNumber, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const breakdown = await prisma.$queryRaw`
    SELECT
      c.id AS "categoryId",
      c.name,
      c.icon,
      c.color,
      COALESCE(SUM(e.amount), 0) AS amount
    FROM "Expense" e
    JOIN "Category" c
      ON c.id = e."categoryId"
    WHERE e."userId" = ${userId}
      AND e.date >= ${startDate}
      AND e.date < ${endDate}
    GROUP BY
      c.id,
      c.name,
      c.icon,
      c.color
    ORDER BY SUM(e.amount) DESC
  `;

  const total = breakdown.reduce(
    (sum, category) => sum + Number(category.amount),
    0,
  );

  return breakdown.map((category) => {
    const amount = Number(category.amount);

    return {
      categoryId: category.categoryId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      amount: Number(amount.toFixed(2)),
      percentage: total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0,
    };
  });
};

export const getMonthlySummary = async (userId) => {
  const monthlySummary = await prisma.$queryRaw`
    SELECT
      TO_CHAR(
        DATE_TRUNC('month', "date"),
        'YYYY-MM'
      ) AS month,
      COALESCE(
        SUM(amount),
        0
      ) AS amount
    FROM "Expense"
    WHERE "userId" = ${userId}
    GROUP BY DATE_TRUNC('month', "date")
    ORDER BY DATE_TRUNC('month', "date") ASC
  `;

  return monthlySummary.map((item) => ({
    month: item.month,
    amount: Number(item.amount),
  }));
};

export const getRecentExpenses = async (userId) => {
  return prisma.expense.findMany({
    where: {
      userId,
    },
    take: 10,
    orderBy: {
      date: "desc",
    },
    select: {
      id: true,
      amount: true,
      description: true,
      paymentMethod: true,
      date: true,
      categoryRef: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });
};

// for frontend dashboard page, to fetch all data in one request

export const getDashboard = async (userId, month) => {
  const [summary, categoryBreakdown, monthlySummary, recentExpenses] =
    await Promise.all([
      getDashboardSummary(userId, month),
      getCategoryBreakdown(userId, month),
      getMonthlySummary(userId),
      getRecentExpenses(userId),
    ]);

  return {
    summary,
    categoryBreakdown,
    monthlySummary,
    recentExpenses,
  };
};
