import apiClient from "@/lib/api/client";

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  categoryRef: ExpenseCategory;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const getExpenses = async (
  filters?: ExpenseFilters,
): Promise<ExpenseListResponse> => {
  const response = await apiClient.get("/expenses", {
    params: filters,
  });

  return response.data.data;
};

export const getExpense = async (id: string): Promise<Expense> => {
  const response = await apiClient.get(`/expenses/${id}`);

  return response.data.data;
};

export const deleteExpense = async (id: string) => {
  const response = await apiClient.delete(`/expenses/${id}`);

  return response.data;
};