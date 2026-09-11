import prisma from "../config/prisma.js";

const backfill = async () => {
  const expenses = await prisma.expense.findMany({
    where: {
      categoryId: null,
    },
  });

  console.log(`Found ${expenses.length} expenses to migrate.`);

  for (const expense of expenses) {
    let category = await prisma.category.findFirst({
      where: {
        userId: expense.userId,
        name: expense.category,
      },
    });

    // Create the category if it doesn't exist
    if (!category) {
      category = await prisma.category.create({
        data: {
          userId: expense.userId,
          name: expense.category,
        },
      });

      console.log(
        `Created category "${category.name}"`,
      );
    }

    await prisma.expense.update({
      where: {
        id: expense.id,
      },
      data: {
        categoryId: category.id,
      },
    });

    console.log(
      `Updated expense ${expense.id} → ${category.name}`,
    );
  }

  console.log("✅ Expense category backfill completed.");
};

backfill()
  .catch((error) => {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });