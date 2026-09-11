import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  getDashboardSummaryController,
  getCategoryBreakdownController,
  getMonthlySummaryController,
  getRecentExpensesController,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummaryController);
router.get("/category-breakdown", authenticate, getCategoryBreakdownController);
router.get("/monthly-summary", authenticate, getMonthlySummaryController);
router.get("/recent-expenses", authenticate, getRecentExpensesController);

export default router;
