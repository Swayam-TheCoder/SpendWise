import apiClient from "@/lib/api/client";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");

  return response.data.data.categories;
};

export const createCategory = async (data: {
  name: string;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  const response = await apiClient.post("/categories", data);

  return response.data.data.category;
};

export const createExpense = async (data: {
  amount: number;
  description: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
}): Promise<Expense> => {
  const response = await apiClient.post("/expenses", data);

  return response.data.data.expense;
};