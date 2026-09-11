import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description is too long"),

  categoryId: z
    .string()
    .uuid("Invalid category ID"),

  paymentMethod: z.enum([
    "CASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "UPI",
    "BANK_TRANSFER",
    "OTHER",
  ]),

  date: z
    .string()
    .datetime()
    .optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();


export const expenseQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  categoryId: z.string().uuid("Invalid category ID").optional(),

  search: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),

  sortBy: z
    .enum(["date", "amount", "createdAt"])
    .default("date"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});

