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

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    </main>
  );
} 