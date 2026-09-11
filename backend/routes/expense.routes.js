import express from "express";

import {
  createExpenseController,
  getExpensesController,
  getExpenseController,
  updateExpenseController,
  deleteExpenseController,
} from "../controllers/expense.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createExpenseController);

router.get("/", authenticate, getExpensesController);

router.get("/:id", authenticate, getExpenseController);

router.patch("/:id", authenticate, updateExpenseController);

router.delete("/:id", authenticate, deleteExpenseController);

export default router;