"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/auth.store";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type Budget,
} from "@/services/budget.service";

import { getCategories, type Category } from "@/services/category.service";
import { useDashboardStore } from "@/features/dashboard/dashboard.store";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BudgetsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const triggerDashboardRefresh = useDashboardStore(
    (state) => state.triggerRefresh,
  );

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [budgetData, categoryData] = await Promise.all([
        getBudgets(selectedMonth),
        getCategories(),
      ]);

      setBudgets(budgetData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      setError("Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthChecked || !isAuthenticated) return;

    loadData();
  }, [isAuthChecked, isAuthenticated, selectedMonth]);

  const monthLabel = new Date(
    `${selectedMonth}-01T00:00:00`,
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const totalBudget = useMemo(
    () => budgets.reduce((total, budget) => total + budget.budget, 0),
    [budgets],
  );

  const totalSpent = useMemo(
    () => budgets.reduce((total, budget) => total + budget.spent, 0),
    [budgets],
  );

  const totalRemaining = Math.max(totalBudget - totalSpent, 0);

  const overallPercentage =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const openCreate = () => {
    setEditingBudget(null);

    setForm({
      categoryId: "",
      amount: "",
    });

    setError(null);
    setShowModal(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);

    setForm({
      categoryId: budget.category.id,
      amount: String(budget.budget),
    });

    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const amount = Number(form.amount);

    if (!editingBudget && !form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingBudget) {
        await updateBudget(editingBudget.id, amount);
      } else {
        await createBudget({
          categoryId: form.categoryId,
          amount,
          month: selectedMonth,
        });
      }

      // Refresh dashboard data
      triggerDashboardRefresh();

      setShowModal(false);
      await loadData();
    } catch (error: any) {
      console.error("Failed to save budget:", error);

      const message =
        error?.response?.data?.message || "Unable to save budget.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget: Budget) => {
    const confirmed = window.confirm(
      `Delete ${budget.category.name} budget for ${monthLabel}?`,
    );

    if (!confirmed) return;

    try {
      await deleteBudget(budget.id);

      triggerDashboardRefresh();

      await loadData();
    } catch (error) {
      console.error("Failed to delete budget:", error);
      alert("Unable to delete budget.");
    }
  };

  if (!isAuthChecked || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-white/35">Loading budgets...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">
              Budget planning
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Control your spending.
            </h1>

            <p className="mt-2 text-sm text-white/35">
              Set limits for each category and keep your spending on track.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMonthDropdownOpen((open) => !open)}
                className="group flex min-w-[190px] items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-left text-sm text-white outline-none transition-all duration-200 hover:border-violet-400/30 hover:bg-white/[0.07] focus:border-violet-400/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <CalendarDays className="h-4 w-4" />
                </span>

                <span className="flex-1">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Viewing
                  </span>

                  <span className="block font-medium text-white/85">
                    {new Date(
                      `${selectedMonth}-01T00:00:00`,
                    ).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </span>

                <ChevronDown
                  className={`h-4 w-4 text-white/35 transition-transform duration-200 ${
                    monthDropdownOpen ? "rotate-180 text-violet-300" : ""
                  }`}
                />
              </button>

              {monthDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] p-2 shadow-2xl shadow-black/50">
                  <div className="mb-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                    Select month
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {Array.from({ length: 12 }, (_, index) => {
                      const date = new Date();

                      date.setDate(1);
                      date.setMonth(date.getMonth() - index);

                      const value = `${date.getFullYear()}-${String(
                        date.getMonth() + 1,
                      ).padStart(2, "0")}`;

                      const label = date.toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      });

                      const isSelected = selectedMonth === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(value);
                            setMonthDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-all duration-150 ${
                            isSelected
                              ? "bg-violet-500/15 text-violet-200"
                              : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <span>{label}</span>

                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/20 text-violet-300">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Create budget
            </button>
          </div>
        </div>

        {/* Overview */}
        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                  <Image
                                    src="/spendwise-logo.png"
                                    alt="SpendWise"
                                    width={130}
                                    height={38}
                                    className="h-10 w-auto object-contain rounded-xl"
                                    priority
                                  />
                </div>

                <div>
                  <p className="text-sm font-medium">{monthLabel} overview</p>

                  <p className="text-xs text-white/30">
                    Across {budgets.length} category
                    {budgets.length === 1 ? "" : "ies"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 lg:min-w-[520px]">
              <BudgetSummary label="Budget" value={totalBudget} />

              <BudgetSummary label="Spent" value={totalSpent} />

              <BudgetSummary label="Remaining" value={totalRemaining} />
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/30">Overall spending</span>

              <span className="text-xs font-medium text-white/60">
                {overallPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all ${
                  overallPercentage >= 100
                    ? "bg-red-400"
                    : overallPercentage >= 80
                      ? "bg-yellow-400"
                      : "bg-white"
                }`}
                style={{
                  width: `${Math.min(overallPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* Error */}
        {error && !showModal && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Budgets */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Category budgets</h2>

            <p className="mt-1 text-xs text-white/30">
              Your spending limits for {monthLabel}
            </p>
          </div>

          {budgets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                <Wallet className="h-6 w-6 text-white/25" />
              </div>

              <h3 className="mt-5 text-base font-medium">No budgets yet</h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-white/30">
                Set your first category budget and start keeping your spending
                under control.
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Create your first budget
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={() => openEdit(budget)}
                  onDelete={() => handleDelete(budget)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0d0d0d] p-6 shadow-2xl">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                {editingBudget ? "Edit budget" : "New budget"}
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {editingBudget
                  ? `Edit ${editingBudget.category.name}`
                  : "Create a category budget"}
              </h2>

              <p className="mt-1 text-sm text-white/30">{monthLabel}</p>
            </div>

            <div className="mt-7 space-y-5">
              {!editingBudget && (
                <div>
                  <label className="mb-2 block text-xs text-white/40">
                    Category
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-white/[0.18]"
                  >
                    <option value="" className="bg-[#111]">
                      Select category
                    </option>

                    {categories
                      .filter(
                        (category) =>
                          !budgets.some(
                            (budget) => budget.category.id === category.id,
                          ),
                      )
                      .map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="bg-[#111]"
                        >
                          {category.icon || "📁"} {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs text-white/40">
                  Monthly limit
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="5000"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.18]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-white/40 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingBudget
                    ? "Save changes"
                    : "Create budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function BudgetSummary({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const percentage = Math.min(budget.percentage, 100);

  const statusConfig = {
    ON_TRACK: {
      label: "On track",
      className: "border-emerald-400/15 bg-emerald-400/5 text-emerald-300",
      icon: CheckCircle2,
    },
    WARNING: {
      label: "Near limit",
      className: "border-yellow-400/15 bg-yellow-400/5 text-yellow-300",
      icon: AlertTriangle,
    },
    OVER_BUDGET: {
      label: "Over budget",
      className: "border-red-400/15 bg-red-400/5 text-red-300",
      icon: AlertTriangle,
    },
  };

  const status = statusConfig[budget.status];
  const StatusIcon = status.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 transition hover:-translate-y-0.5 hover:border-white/[0.13]">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl"
        style={{
          backgroundColor: budget.category.color || "#a78bfa",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{
                backgroundColor: `${budget.category.color || "#a78bfa"}20`,
              }}
            >
              {budget.category.icon || "📁"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {budget.category.name}
              </p>

              <p className="mt-1 text-xs text-white/25">Monthly budget</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-32 overflow-hidden rounded-xl border border-white/[0.1] bg-[#151515] p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              ₹{budget.spent.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-white/25">
              of ₹{budget.budget.toLocaleString("en-IN")}
            </p>
          </div>

          <span
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] ${status.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all ${
                budget.status === "OVER_BUDGET"
                  ? "bg-red-400"
                  : budget.status === "WARNING"
                    ? "bg-yellow-400"
                    : "bg-white"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-white/25">
              {budget.percentage}% used
            </span>

            <span className="text-[10px] text-white/35">
              {budget.remaining > 0
                ? `₹${budget.remaining.toLocaleString("en-IN")} remaining`
                : `₹${Math.max(budget.spent - budget.budget, 0).toLocaleString(
                    "en-IN",
                  )} over`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
