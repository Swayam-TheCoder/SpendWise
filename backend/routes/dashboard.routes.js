import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  getDashboardSummaryController,
  getCategoryBreakdownController,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummaryController);
router.get("/category-breakdown", authenticate, getCategoryBreakdownController);

export default router;
