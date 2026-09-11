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

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category is too long"),

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

export const updateExpenseSchema =
  createExpenseSchema.partial();