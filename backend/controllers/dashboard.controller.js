import {
  getDashboardSummary,
  getCategoryBreakdown,
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