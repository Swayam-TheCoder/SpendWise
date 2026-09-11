import apiClient from "@/lib/api/client";

export interface DashboardSummary {
  totalSpent: number;
  thisMonth: number;
  today: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  amount: number;
}

export interface RecentExpense {
  id: string;
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  categoryRef: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  categoryBreakdown: CategoryBreakdown[];
  monthlySummary: MonthlySummary[];
  recentExpenses: RecentExpense[];
}

export const getDashboard = async (
  month?: string,
): Promise<DashboardData> => {
  const response = await apiClient.get("/dashboard", {
    params: month ? { month } : undefined,
  });

  return response.data.data;
};