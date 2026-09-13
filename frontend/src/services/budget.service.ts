import apiClient from "@/lib/api/client";

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Budget {
  id: string;
  category: BudgetCategory;
  month: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "ON_TRACK" | "WARNING" | "OVER_BUDGET";
}

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  month: string;
}

export const getBudgets = async (
  month: string,
): Promise<Budget[]> => {
  const response = await apiClient.get("/budgets", {
    params: { month },
  });

  return response.data.data.budgets;
};

export const createBudget = async (
  data: CreateBudgetData,
): Promise<Budget> => {
  const response = await apiClient.post("/budgets", data);

  return response.data.data.budget;
};

export const updateBudget = async (
  id: string,
  amount: number,
) => {
  const response = await apiClient.patch(
    `/budgets/${id}`,
    { amount },
  );

  return response.data.data.budget;
};

export const deleteBudget = async (id: string) => {
  const response = await apiClient.delete(
    `/budgets/${id}`,
  );

  return response.data;
};