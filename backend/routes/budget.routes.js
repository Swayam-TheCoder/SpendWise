import express from "express";

import {
  createBudgetController,
  getBudgetsController,
  getBudgetController,
  updateBudgetController,
  deleteBudgetController,
} from "../controllers/budget.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/", authenticate, createBudgetController);

router.get("/", authenticate, getBudgetsController);

router.get("/:id", authenticate, getBudgetController);

router.patch("/:id", authenticate, updateBudgetController);

router.delete("/:id", authenticate, deleteBudgetController);

export default router;
