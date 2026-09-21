import prisma from "../config/prisma.js";
import { DEFAULT_CATEGORIES } from "../constants/defaultCategories.js";

const backfillDefaultCategories = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      const categories = DEFAULT_CATEGORIES.map((category) => ({
        userId: user.id,
        ...category,
      }));

      const result = await prisma.category.createMany({
        data: categories,
        skipDuplicates: true,
      });

      console.log(
        `${user.email}: ${result.count} default categories added`,
      );
    }

    console.log("Default category backfill completed.");
  } catch (error) {
    console.error("Default category backfill failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

backfillDefaultCategories();