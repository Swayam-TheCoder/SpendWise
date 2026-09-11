"use client";

import { useAuthStore } from "@/features/auth/auth.store";
import { getDashboard } from "@/services/dashboard.service";
import type { DashboardData } from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Home,
  MoreHorizontal,
  PieChart,
  Plus,
  Receipt,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const navItems = [
  {
    label: "Overview",
    icon: Home,
    active: true,
  },
  {
    label: "Transactions",
    icon: Receipt,
  },
  {
    label: "Budgets",
    icon: Target,
  },
  {
    label: "Analytics",
    icon: PieChart,
  },
];

const accountItems = [
  {
    label: "Settings",
    icon: Settings,
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const firstName = user?.name?.split(" ")[0] || "there";

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboard(selectedMonth);

        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedMonth]);

  const logout = useAuthStore((state) => state.logout);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] p-6 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[0.06]" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-[380px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03] lg:col-span-2" />
            <div className="h-[380px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>

          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>

          <p className="mt-2 text-sm text-white/50">
            Something went wrong while fetching your data.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="flex min-h-screen">
        {/* ================= SIDEBAR ================= */}

        <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.08] bg-[#0a0a0a] lg:block">
          {/* Logo */}

          <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-[17px] font-semibold tracking-tight">
                  SpendWise
                </h1>

                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                  Finance OS
                </p>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-76px)] flex-col px-3 py-5">
            {/* Workspace */}

            <div className="mb-7 px-3">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                Workspace
              </p>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold">
                    S
                  </div>

                  <div>
                    <p className="text-xs font-medium">{firstName}</p>

                    <p className="text-[10px] text-white/30">Personal</p>
                  </div>
                </div>

                <ChevronDown className="h-3.5 w-3.5 text-white/30" />
              </div>
            </div>

            {/* Navigation */}

            <div className="px-2">
              <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                Manage
              </p>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        item.active
                          ? "bg-white text-black"
                          : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <Icon className="h-[17px] w-[17px]" />

                      <span>{item.label}</span>

                      {item.active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-black" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insights */}

            <div className="mt-7 px-2">
              <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                Insights
              </p>

              <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white">
                <Sparkles className="h-[17px] w-[17px]" />
                AI Insights
                <span className="ml-auto rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[9px] text-violet-400">
                  AI
                </span>
              </button>

              <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white">
                <Download className="h-[17px] w-[17px]" />
                Reports
              </button>
            </div>

            {/* Account */}

            <div className="mt-7 px-2">
              <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                Account
              </p>

              {accountItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <Icon className="h-[17px] w-[17px]" />

                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom profile */}

            <div className="mt-auto">
              <div className="mb-3 rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.08] to-fuchsia-500/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-400" />

                  <span className="text-xs font-medium">Spend smarter</span>
                </div>

                <p className="mt-2 text-[10px] leading-4 text-white/35">
                  You're doing better than 78% of users this month.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{firstName}</p>

                  <p className="truncate text-[10px] text-white/30">
                    {user?.email}
                  </p>
                </div>

                <MoreHorizontal className="ml-auto h-4 w-4 text-white/30" />
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}

        <main className="min-w-0 flex-1">
          {/* TOP BAR */}

          <header className="flex h-[76px] items-center justify-between border-b border-white/[0.08] px-6 lg:px-9">
            <div>
              <p className="text-xs text-white/30">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <h2 className="mt-0.5 text-sm font-medium">Financial overview</h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] transition hover:bg-white/[0.06]">
                <Bell className="h-4 w-4 text-white/60" />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
              </button>

              <label className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-white/60 transition hover:bg-white/[0.05] sm:flex">
                <span>
                  {new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>

                <ChevronDown className="h-3 w-3" />

                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="absolute h-0 w-0 opacity-0"
                  aria-label="Select month"
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - index);

                    const value = `${date.getFullYear()}-${String(
                      date.getMonth() + 1,
                    ).padStart(2, "0")}`;

                    return (
                      <option key={value} value={value}>
                        {date.toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </option>
                    );
                  })}
                </select>
              </label>

              <button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-white/90">
                <Plus className="h-3.5 w-3.5" />
                Add transaction
              </button>
            </div>
          </header>

          {/* CONTENT */}

          <div className="p-6 lg:p-9">
            {/* Heading */}

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

                  <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-400">
                    Everything looks good
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                  Good evening, {firstName}.
                </h1>

                <p className="mt-2 text-sm text-white/35">
                  Here's what's happening with your money.
                </p>
              </div>
            </div>

            {/* ================= BALANCE ================= */}

            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
              {/* Main balance */}

              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#171717] via-[#101010] to-[#0b0b0b] p-6">
                {/* Glow */}

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-[80px]" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07]">
                        <Wallet className="h-4 w-4 text-white/70" />
                      </div>

                      <span className="text-xs text-white/40">
                        Total balance
                      </span>
                    </div>

                    <button className="text-white/30 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <p className="text-4xl font-semibold tracking-tight">
                      ₹
                      {dashboard?.summary.totalSpent.toLocaleString("en-IN") ??
                        "0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Income */}

              <StatCard
                title="This month"
                value={`₹${dashboard?.summary.thisMonth.toLocaleString("en-IN") ?? "0"}`}
                change="Spending"
                positive
                icon={<ArrowUpRight className="h-4 w-4" />}
              />

              <StatCard
                title="Today"
                value={`₹${dashboard?.summary.today.toLocaleString("en-IN") ?? "0"}`}
                change="Today"
                positive
                icon={<CreditCard className="h-4 w-4" />}
              />

              <StatCard
                title="Transactions"
                value={String(dashboard?.summary.transactionCount ?? 0)}
                change="This month"
                positive
                icon={<Receipt className="h-4 w-4" />}
              />
            </div>

            {/* ================= CHARTS ================= */}

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              {/* Spending chart */}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Spending trend</p>

                    <p className="mt-1 text-xs text-white/30">
                      Your monthly spending
                    </p>
                  </div>

                  <button className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/40">
                    Last 7 months
                  </button>
                </div>

                <div className="mt-8 h-[270px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        dashboard?.monthlySummary.map((item) => ({
                          month: item.month.slice(5),
                          expense: item.amount,
                        })) ?? []
                      }
                    >
                      <defs>
                        <linearGradient
                          id="incomeGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopOpacity={0.3} />
                          <stop offset="100%" stopOpacity={0} />
                        </linearGradient>

                        <linearGradient
                          id="expenseGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopOpacity={0.15} />
                          <stop offset="100%" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "rgba(255,255,255,0.3)",
                          fontSize: 10,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "rgba(255,255,255,0.25)",
                          fontSize: 10,
                        }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#161616",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="expense"
                        strokeWidth={2}
                        stroke="#fb7185"
                        fill="url(#expenseGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex gap-5">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    Income
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    Expenses
                  </div>
                </div>
              </div>

              {/* Categories */}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Spending breakdown</p>

                    <p className="mt-1 text-xs text-white/30">
                      Where your money went
                    </p>
                  </div>

                  <PieChart className="h-4 w-4 text-white/25" />
                </div>

                <div className="relative mt-5 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      {dashboard?.categoryBreakdown &&
                      dashboard.categoryBreakdown.length > 0 ? (
                        <Pie
                          data={dashboard.categoryBreakdown}
                          dataKey="percentage"
                          nameKey="name"
                          innerRadius={65}
                          outerRadius={88}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {dashboard.categoryBreakdown.map((category) => (
                            <Cell
                              key={category.categoryId}
                              fill={category.color || "#a78bfa"}
                            />
                          ))}
                        </Pie>
                      ) : (
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="rgba(255,255,255,0.4)"
                          fontSize={12}
                        >
                          No spending yet
                        </text>
                      )}
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-semibold">
                      ₹
                      {dashboard?.summary.thisMonth.toLocaleString("en-IN") ??
                        "0"}
                    </span>

                    <span className="text-[10px] text-white/30">
                      Total spent
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(dashboard?.categoryBreakdown ?? []).map((category) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: category.color || "#a78bfa",
                          }}
                        />

                        <span className="text-xs text-white/50">
                          {category.name}
                        </span>
                      </div>

                      <span className="text-xs font-medium">
                        {category.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= BOTTOM ================= */}

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
              {/* Transactions */}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                  <div>
                    <p className="text-sm font-medium">Recent transactions</p>

                    <p className="mt-1 text-xs text-white/30">
                      Your latest activity
                    </p>
                  </div>

                  <button className="text-xs text-white/40 transition hover:text-white">
                    View all
                  </button>
                </div>

                <div>
                  {dashboard?.recentExpenses.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                        <Receipt className="h-5 w-5 text-white/30" />
                      </div>

                      <p className="text-sm font-medium text-white/70">
                        No transactions yet
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Add your first expense to start tracking your spending.
                      </p>

                      <button
                        onClick={() => router.push("/expenses")}
                        className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
                      >
                        Add expense
                      </button>
                    </div>
                  ) : (
                    dashboard.recentExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-4 border-b border-white/[0.05] px-6 py-4 last:border-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-lg">
                          {expense.categoryRef.icon || "💳"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {expense.description}
                          </p>

                          <p className="mt-0.5 text-[10px] text-white/30">
                            {expense.categoryRef.name} ·{" "}
                            {new Date(expense.date).toLocaleDateString("en-IN")}
                          </p>
                        </div>

                        <span className="text-sm font-medium">
                          -₹{Number(expense.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Budget */}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Monthly budget</p>

                    <p className="mt-1 text-xs text-white/30">
                      August spending limit
                    </p>
                  </div>

                  <Target className="h-4 w-4 text-violet-400" />
                </div>

                <div className="mt-8">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="text-sm text-white/40">Monthly budget</p>

                      <h3 className="mt-3 text-2xl font-semibold">
                        Coming soon
                      </h3>

                      <p className="mt-2 text-sm text-white/30">
                        Set spending limits for your categories.
                      </p>
                    </div>

                    <button
                      onClick={() => router.push("/budgets")}
                      className="mt-6 w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]"
                    >
                      Create a budget
                    </button>
                  </div>
                </div>

                {/* Insight */}

                <div className="mt-8 rounded-xl border border-violet-500/10 bg-violet-500/[0.05] p-4">
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />

                    <div>
                      <p className="text-xs font-medium">Smart insight</p>

                      <p className="mt-1 text-[10px] leading-4 text-white/35">
                        You're spending 14% less on food this month. Keep it up
                        — you're on track to save ₹3,200.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6 transition hover:border-white/[0.14]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
            {icon}
          </div>

          <span className="text-xs text-white/40">{title}</span>
        </div>

        <MoreHorizontal className="h-4 w-4 text-white/20" />
      </div>

      <p className="mt-6 text-2xl font-semibold tracking-tight">{value}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`text-[10px] font-medium ${
            positive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {change}
        </span>

        <span className="text-[10px] text-white/25">this month</span>
      </div>
    </div>
  );
}
