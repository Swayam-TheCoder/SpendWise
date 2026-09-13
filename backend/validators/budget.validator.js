import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),

  amount: z
    .number()
    .positive("Budget amount must be greater than 0"),

  month: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      "Month must be in YYYY-MM format",
    ),
});

export const updateBudgetSchema = z.object({
  amount: z
    .number()
    .positive("Budget amount must be greater than 0")
    .optional(),
});