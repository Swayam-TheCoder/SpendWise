import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

export const createCategoryController = async (req, res) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const category = await createCategory({
      userId: req.userId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
};

export const getCategoriesController = async (req, res) => {
  try {
    const categories = await getCategories(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const category = await getCategoryById(req.userId, req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch category",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const validation = updateCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existingCategory = await getCategoryById(req.userId, req.params.id);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const result = await updateCategory(
      req.userId,
      req.params.id,
      validation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        updated: result.count,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const result = await deleteCategory(req.userId, req.params.id);

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    // PostgreSQL foreign-key violation
    if (
      error?.meta?.code === "23001" ||
      error?.message?.includes("violates RESTRICT setting")
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete category because it is being used by expenses",
      });
    }

    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
};
