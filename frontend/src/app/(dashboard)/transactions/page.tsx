"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  ArrowLeft,
} from "lucide-react";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type Expense,
  ExpenseListResponse,
} from "@/services/expense.service";

import { getCategories, type Category } from "@/services/category.service";
import { useDashboardStore } from "@/features/dashboard/dashboard.store";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "createdAt">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const triggerDashboardRefresh = useDashboardStore(
    (state) => state.triggerRefresh,
  );

  const [page, setPage] = useState(1);
  const requestIdRef = useRef(0);
  const [pagination, setPagination] = useState<
    ExpenseListResponse["pagination"] | null
  >(null);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [form, setForm] = useState({
    amount: "",
    description: "",
    categoryId: "",
    paymentMethod: "OTHER",
    date: new Date().toISOString().split("T")[0],
  });

  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    categoryId,
    startDate,
    endDate,
    sortBy !== "date" ? sortBy : "",
    sortOrder !== "desc" ? sortOrder : "",
  ].filter(Boolean).length;

  const openAddExpense = async () => {
    try {
      const data = await getCategories();

      setCategories(data);
      setEditingExpense(null);

      setForm({
        amount: "",
        description: "",
        categoryId: data[0]?.id || "",
        paymentMethod: "OTHER",
        date: new Date().toISOString().split("T")[0],
      });

      setShowAddExpense(true);
    } catch (error) {
      console.error("Failed to load categories:", error);
      alert("Unable to load categories.");
    }
  };

  const openEditExpense = async (expense: Expense) => {
    try {
      const data = await getCategories();

      setCategories(data);

      setForm({
        amount: String(expense.amount),
        description: expense.description,
        categoryId: expense.categoryRef.id,
        paymentMethod: expense.paymentMethod,
        date: new Date(expense.date).toISOString().split("T")[0],
      });

      setEditingExpense(expense);
      setShowAddExpense(true);
    } catch (error) {
      console.error("Failed to open expense:", error);
      alert("Unable to load expense.");
    }
  };

  const loadExpenses = async (requestedPage = page) => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const data = await getExpenses({
        page: requestedPage,
        limit: 10,
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });

      // Ignore an older request that finished after a newer request.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setExpenses(data.expenses);
      setPagination(data.pagination);

      // Backend may return a corrected page.
      if (data.pagination?.page !== requestedPage) {
        setPage(data.pagination.page);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to load expenses:", error);
      setError("Unable to load transactions.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const filterKey = [
    search.trim(),
    categoryId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ].join("|");

  const previousFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    const filtersChanged = previousFilterKeyRef.current !== filterKey;

    previousFilterKeyRef.current = filterKey;

    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    const timeout = setTimeout(
      () => {
        loadExpenses(page);
      },
      search.trim() ? 350 : 0,
    );

    return () => clearTimeout(timeout);
  }, [filterKey, page]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);

      triggerDashboardRefresh();

      // If this was the last item on the current page,
      // move back to the previous page.
      if (expenses.length === 1 && page > 1) {
        setPage((current) => current - 1);
        return;
      }

      await loadExpenses(page);
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Unable to delete transaction.");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white md:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
          <p className="mb-2 text-sm text-white/35">Your finances</p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Track and manage all your expenses.
          </p>
        </div>

        <button
          onClick={openAddExpense}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Plus size={17} />
          Add expense
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4">
        <Search size={18} className="text-white/30" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/25"
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        {/* Mobile filter trigger */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm transition hover:bg-white/[0.05] md:hidden"
        >
          <span className="flex items-center gap-2 text-white/70">
            <SlidersHorizontal size={16} />
            Filters
          </span>

          <span className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-400 px-1.5 text-[10px] font-semibold text-black">
                {activeFilterCount}
              </span>
            )}

            <span className="text-white/30">
              {showFilters ? "Hide" : "Edit"}
            </span>
          </span>
        </button>

        {/* Desktop filters */}
        <div className="hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 md:block">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white/70">
              <SlidersHorizontal size={16} />
              Filters
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCategoryId("");
                  setStartDate("");
                  setEndDate("");
                  setSortBy("date");
                  setSortOrder("desc");
                }}
                className="flex items-center gap-1.5 text-xs text-white/35 transition hover:text-white"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {/* Category */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>

            {/* Start */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            />

            {/* End */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "amount" | "createdAt")
              }
              className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            >
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
              <option value="createdAt">Sort by created</option>
            </select>

            {/* Order */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((current) => (current === "desc" ? "asc" : "desc"))
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowUpDown size={16} />

              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </button>
          </div>
        </div>

        {/* Mobile filter sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Sheet */}
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/[0.08] bg-[#0c0c0c] px-5 pb-6 pt-4 shadow-2xl">
              {/* Handle */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-white/30">
                    Narrow down your transactions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/40">
                    Category
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151515] px-3 text-sm text-white outline-none"
                  >
                    <option value="">All categories</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/40">
                    Date range
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151515] px-3 text-sm text-white outline-none"
                    />

                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151515] px-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/40">
                    Sort by
                  </label>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "date" | "amount" | "createdAt",
                      )
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151515] px-3 text-sm text-white outline-none"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="createdAt">Created</option>
                  </select>
                </div>

                {/* Order */}
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder((current) =>
                      current === "desc" ? "asc" : "desc",
                    )
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#151515] px-3 text-sm text-white/70"
                >
                  <span>Order</span>

                  <span className="flex items-center gap-2 text-white/50">
                    <ArrowUpDown size={14} />

                    {sortOrder === "desc" ? "Newest first" : "Oldest first"}
                  </span>
                </button>
              </div>

              {/* Bottom actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId("");
                    setStartDate("");
                    setEndDate("");
                    setSortBy("date");
                    setSortOrder("desc");
                  }}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 rounded-xl bg-white py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]">
        <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_50px] border-b border-white/[0.06] px-6 py-4 text-xs uppercase tracking-wider text-white/30 md:grid">
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span />
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-white/[0.04]"
              />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-white/[0.05] p-4">
              <Search size={22} className="text-white/30" />
            </div>

            <h3 className="font-medium text-white/80">No transactions found</h3>

            <p className="mt-2 text-sm text-white/30">
              Try another search or add your first expense.
            </p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid gap-3 border-b border-white/[0.05] px-4 py-4 transition hover:bg-white/[0.025] sm:px-6 sm:py-5 md:grid-cols-[2fr_1.2fr_1fr_1fr_50px] md:items-center"
            >
              {/* Description + amount */}
              <div className="flex items-start justify-between gap-4 md:block">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white/90">
                    {expense.description}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {expense.paymentMethod}
                  </p>
                </div>

                {/* Mobile amount */}
                <div className="shrink-0 font-medium text-white md:hidden">
                  − ₹
                  {expense.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <span
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs"
                  style={{
                    backgroundColor: `${
                      expense.categoryRef.color || "#a78bfa"
                    }15`,
                    color: expense.categoryRef.color || "#a78bfa",
                  }}
                >
                  {expense.categoryRef.icon && (
                    <span className="mr-1.5">{expense.categoryRef.icon}</span>
                  )}

                  {expense.categoryRef.name}
                </span>
              </div>

              {/* Date */}
              <div className="text-xs text-white/35 md:text-sm">
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Amount */}
              <div className="hidden font-medium text-white md:block">
                − ₹
                {expense.amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditExpense(expense)}
                  className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white"
                  title="Edit transaction"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete transaction"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              disabled={pagination.page === 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-9 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
            >
              Previous
            </button>

            <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-white/[0.07] px-3 text-xs font-medium text-white">
              {pagination.page}
            </div>

            <button
              type="button"
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
              className="flex h-9 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingExpense ? "Edit expense" : "Add expense"}
                </h2>
                <p className="mt-1 text-sm text-white/35">
                  Record a new transaction.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddExpense(false);
                  setEditingExpense(null);
                }}
                className="rounded-lg px-3 py-2 text-white/40 hover:bg-white/[0.05] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (
                  !form.amount ||
                  !form.description ||
                  !form.categoryId ||
                  !form.date
                ) {
                  alert("Please fill all required fields.");
                  return;
                }

                try {
                  setSaving(true);

                  const expenseData = {
                    amount: Number(form.amount),
                    description: form.description,
                    categoryId: form.categoryId,
                    paymentMethod: form.paymentMethod,
                    date: new Date(form.date).toISOString(),
                  };

                  if (editingExpense) {
                    await updateExpense(editingExpense.id, expenseData);
                  } else {
                    await createExpense(expenseData);
                  }

                  // Refresh dashboard
                  triggerDashboardRefresh();

                  setShowAddExpense(false);
                  setEditingExpense(null);

                  await loadExpenses();
                } catch (error) {
                  console.error("Failed to create expense:", error);
                  alert("Unable to create expense.");
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-4"
            >
              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Amount
                </label>

                <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4">
                  <span className="text-white/40">₹</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full bg-transparent px-3 py-3 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Description
                </label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Dinner with friends"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-white/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Category
                </label>

                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ""}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Payment method
                </label>

                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 text-sm outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm text-white/50">Date</label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 rounded-xl border border-white/[0.08] px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.05]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingExpense
                      ? "Save changes"
                      : "Add expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
