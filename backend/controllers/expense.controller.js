import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../services/expense.service.js";

import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.validator.js";

export const createExpenseController = async (req, res) => {
  try {
    const validation = createExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const expense = await createExpense({
      userId: req.userId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: {
        expense,
      },
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create expense",
    });
  }
};

export const getExpensesController = async (req, res) => {
  try {
    const expenses = await getExpenses(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        expenses,
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch expenses",
    });
  }
};

export const getExpenseController = async (req, res) => {
  try {
    const expense = await getExpenseById(
      req.userId,
      req.params.id,
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        expense,
      },
    });
  } catch (error) {
    console.error("Get expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch expense",
    });
  }
};

export const updateExpenseController = async (req, res) => {
  try {
    const validation = updateExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existingExpense = await getExpenseById(
      req.userId,
      req.params.id,
    );

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const data = {
      ...validation.data,
      ...(validation.data.date && {
        date: new Date(validation.data.date),
      }),
    };

    const result = await updateExpense(
      req.userId,
      req.params.id,
      data,
    );

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: {
        updated: result.count,
      },
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update expense",
    });
  }
};

export const deleteExpenseController = async (req, res) => {
  try {
    const result = await deleteExpense(
      req.userId,
      req.params.id,
    );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete expense",
    });
  }
};