import {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlySummary,
  getRecentExpenses,
} from "../services/dashboard.service.js";

export const getDashboardSummaryController = async (req, res) => {
  try {
    const summary = await getDashboardSummary(req.userId);

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
    const breakdown = await getCategoryBreakdown(req.userId);

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