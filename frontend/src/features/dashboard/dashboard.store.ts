import { create } from "zustand";

interface DashboardStore {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  refreshKey: 0,

  triggerRefresh: () =>
    set((state) => ({
      refreshKey: state.refreshKey + 1,
    })),
}));