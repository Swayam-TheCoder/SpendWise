import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
} from "../services/budget.service.js";

export const createBudgetController = async (req, res, next) => {
  try {
    const budget = await createBudget(req.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: {
        budget,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetsController = async (req, res, next) => {
  try {
    const budgets = await getBudgets(req.userId, req.query.month);

    return res.status(200).json({
      success: true,
      data: {
        budgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetController = async (req, res, next) => {
  try {
    const budget = await getBudget(req.userId, req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        budget,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBudgetController = async (req, res, next) => {
  try {
    const budget = await updateBudget(req.userId, req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: {
        budget,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudgetController = async (req, res, next) => {
  try {
    await deleteBudget(req.userId, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
