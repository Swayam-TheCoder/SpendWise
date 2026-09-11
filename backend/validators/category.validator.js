import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),

  icon: z
    .string()
    .trim()
    .max(50, "Icon value is too long")
    .optional(),

  color: z
    .string()
    .trim()
    .max(30, "Color value is too long")
    .optional(),
});

export const updateCategorySchema =
  createCategorySchema.partial();