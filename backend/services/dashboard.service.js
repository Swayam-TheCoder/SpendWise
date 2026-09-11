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
    // Current month
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const [
    totalSpentResult,
    monthlySpentResult,
    todaySpentResult,
    transactionCount,
  ] = await prisma.$transaction([
    // All-time spending
    prisma.expense.aggregate({
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
    }),

    // Selected month
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

    // Today
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

    // Transactions in selected month
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
    thisMonth: Number(monthlySpentResult._sum.amount || 0),
    today: Number(todaySpentResult._sum.amount || 0),
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
    // Current month
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: {
      amount: true,
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

  const breakdownMap = new Map();

  for (const expense of expenses) {
    const category = expense.categoryRef;

    if (!breakdownMap.has(category.id)) {
      breakdownMap.set(category.id, {
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        amount: 0,
      });
    }

    const current = breakdownMap.get(category.id);

    current.amount += Number(expense.amount);
  }

  const breakdown = Array.from(breakdownMap.values())
    .sort((a, b) => b.amount - a.amount);

  const total = breakdown.reduce(
    (sum, category) => sum + category.amount,
    0,
  );

  return breakdown.map((category) => ({
    ...category,
    amount: Number(category.amount.toFixed(2)),
    percentage:
      total > 0
        ? Number(((category.amount / total) * 100).toFixed(2))
        : 0,
  }));
};

export const getMonthlySummary = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
    },
    select: {
      amount: true,
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const monthlyMap = new Map();

  for (const expense of expenses) {
    const date = new Date(expense.date);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: key,
        amount: 0,
      });
    }

    const current = monthlyMap.get(key);

    current.amount += Number(expense.amount);
  }

  return Array.from(monthlyMap.values()).map((item) => ({
    ...item,
    amount: Number(item.amount.toFixed(2)),
  }));
};

export const getRecentExpenses = async (userId) => {
  return prisma.expense.findMany({
    where: {
      userId,
    },
    take: 5,
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