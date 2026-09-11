"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  ArrowUpDown,
} from "lucide-react";
import {
  getExpenses,
  deleteExpense,
  type Expense,
} from "@/services/expense.service";

import { createExpense, getCategories, type Category } from "@/services/category.service";

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showAddExpense, setShowAddExpense] = useState(false);
const [categories, setCategories] = useState<Category[]>([]);
const [saving, setSaving] = useState(false);

const [form, setForm] = useState({
  amount: "",
  description: "",
  categoryId: "",
  paymentMethod: "OTHER",
  date: new Date().toISOString().split("T")[0],
});

const openAddExpense = async () => {
  try {
    const data = await getCategories();
    setCategories(data);

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

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getExpenses({
        page: 1,
        limit: 20,
        search: search || undefined,
        sortBy: "date",
        sortOrder: "desc",
      });

      setExpenses(data.expenses);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadExpenses();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    try {
      await deleteExpense(id);

      setExpenses((current) =>
        current.filter((expense) => expense.id !== id),
      );
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

            <h3 className="font-medium text-white/80">
              No transactions found
            </h3>

            <p className="mt-2 text-sm text-white/30">
              Try another search or add your first expense.
            </p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid gap-4 border-b border-white/[0.05] px-6 py-5 transition hover:bg-white/[0.025] md:grid-cols-[2fr_1.2fr_1fr_1fr_50px] md:items-center"
            >
              {/* Description */}
              <div>
                <p className="font-medium text-white/90">
                  {expense.description}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {expense.paymentMethod}
                </p>
              </div>

              {/* Category */}
              <div>
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs"
                  style={{
                    backgroundColor: `${
                      expense.categoryRef.color || "#a78bfa"
                    }15`,
                    color: expense.categoryRef.color || "#a78bfa",
                  }}
                >
                  {expense.categoryRef.icon && (
                    <span className="mr-1.5">
                      {expense.categoryRef.icon}
                    </span>
                  )}

                  {expense.categoryRef.name}
                </span>
              </div>

              {/* Date */}
              <div className="text-sm text-white/40">
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Amount */}
              <div className="font-medium text-white">
                − ₹
                {expense.amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddExpense && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Add expense</h2>
          <p className="mt-1 text-sm text-white/35">
            Record a new transaction.
          </p>
        </div>

        <button
          onClick={() => setShowAddExpense(false)}
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

            await createExpense({
              amount: Number(form.amount),
              description: form.description,
              categoryId: form.categoryId,
              paymentMethod: form.paymentMethod,
              date: new Date(form.date).toISOString(),
            });

            setShowAddExpense(false);

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
          <label className="mb-2 block text-sm text-white/50">
            Date
          </label>

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
            {saving ? "Saving..." : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </main>
  );
} 