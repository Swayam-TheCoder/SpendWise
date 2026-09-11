import {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlySummary,
  getRecentExpenses,
  getDashboard,
} from "../services/dashboard.service.js";
import { dashboardQuerySchema } from "../validators/dashboard.validator.js";

export const getDashboardSummaryController = async (req, res) => {
  try {
    const validation = dashboardQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid dashboard filters",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const summary = await getDashboardSummary(
      req.userId,
      validation.data.month,
    );

    return res.status(200).json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
    console.error("Get dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard summary",
    });
  }
};

export const getCategoryBreakdownController = async (req, res) => {
  try {
    const validation = dashboardQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid dashboard filters",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const breakdown = await getCategoryBreakdown(
      req.userId,
      validation.data.month,
    );

    return res.status(200).json({
      success: true,
      data: {
        breakdown,
      },
    });
  } catch (error) {
    console.error("Get category breakdown error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch category breakdown",
    });
  }
};

export const getMonthlySummaryController = async (req, res) => {
  try {
    const summary = await getMonthlySummary(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
    console.error("Get monthly summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch monthly summary",
    });
  }
};

export const getRecentExpensesController = async (req, res) => {
  try {
    const expenses = await getRecentExpenses(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        expenses,
      },
    });
  } catch (error) {
    console.error("Get recent expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch recent expenses",
    });
  }
};



// for frontend dashboard page, to fetch all data in one request

export const getDashboardController = async (req, res) => {
  try {
    const dashboard = await getDashboard(req.userId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard data",
    });
  }
};