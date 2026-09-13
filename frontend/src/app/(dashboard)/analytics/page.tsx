"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  PieChart,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuthStore } from "@/features/auth/auth.store";
import {
  getDashboard,
  type DashboardData,
} from "@/services/dashboard.service";

export default function AnalyticsPage() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isAuthChecked = useAuthStore(
    (state) => state.isAuthChecked,
  );

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!isAuthChecked || !isAuthenticated) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboard(selectedMonth);

        setDashboard(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [isAuthChecked, isAuthenticated, selectedMonth]);

  const monthLabel = new Date(
    `${selectedMonth}-01T00:00:00`,
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const averageDaily = useMemo(() => {
    if (!dashboard) return 0;

    const [year, month] = selectedMonth
      .split("-")
      .map(Number);

    const daysInMonth = new Date(
      year,
      month,
      0,
    ).getDate();

    return dashboard.summary.thisMonth / daysInMonth;
  }, [dashboard, selectedMonth]);

  const topCategory =
    dashboard?.categoryBreakdown?.length
      ? [...dashboard.categoryBreakdown].sort(
          (a, b) =>
            Number(b.amount) - Number(a.amount),
        )[0]
      : null;

  const chartData =
    dashboard?.monthlySummary?.map((item) => ({
      month: new Date(
        `${item.month}-01T00:00:00`,
      ).toLocaleDateString("en-IN", {
        month: "short",
      }),
      amount: Number(item.amount),
    })) ?? [];

  if (!isAuthChecked || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-white/35">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-2 text-xs text-white/30">
            Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/35">
              <BarChart3 className="h-4 w-4" />

              <span className="text-xs uppercase tracking-[0.2em]">
                Analytics
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Understand your spending.
            </h1>

            <p className="mt-2 text-sm text-white/35">
              See where your money goes and how your spending changes
              over time.
            </p>
          </div>

          {/* Month selector */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

            <select
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
              className="appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-10 text-sm text-white outline-none transition hover:bg-white/[0.06] focus:border-white/[0.15]"
            >
              {Array.from({ length: 12 }, (_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() - index);

                const value = `${date.getFullYear()}-${String(
                  date.getMonth() + 1,
                ).padStart(2, "0")}`;

                const label = date.toLocaleDateString(
                  "en-IN",
                  {
                    month: "long",
                    year: "numeric",
                  },
                );

                return (
                  <option
                    key={value}
                    value={value}
                    className="bg-[#111]"
                  >
                    {label}
                  </option>
                );
              })}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            title="Total spent"
            value={`₹${dashboard.summary.thisMonth.toLocaleString(
              "en-IN",
            )}`}
            subtitle={monthLabel}
            icon={<Wallet className="h-4 w-4" />}
          />

          <AnalyticsCard
            title="Daily average"
            value={`₹${Math.round(
              averageDaily,
            ).toLocaleString("en-IN")}`}
            subtitle="Average per day"
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <AnalyticsCard
            title="Transactions"
            value={String(
              dashboard.summary.transactionCount,
            )}
            subtitle={`Transactions in ${monthLabel}`}
            icon={<Receipt className="h-4 w-4" />}
          />

          <AnalyticsCard
            title="Top category"
            value={topCategory?.name || "—"}
            subtitle={
              topCategory
                ? `₹${Number(
                    topCategory.amount,
                  ).toLocaleString("en-IN")}`
                : "No spending yet"
            }
            icon={<PieChart className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Spending trend */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium">
                Spending trend
              </p>

              <p className="mt-1 text-xs text-white/30">
                Your spending over the last several months
              </p>
            </div>

            <div className="mt-8 h-[320px]">
              {chartData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="analyticsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />
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
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 11,
                      }}
                      tickFormatter={(value) =>
                        `₹${value >= 1000 ? `${value / 1000}k` : value}`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString(
                          "en-IN",
                        )}`,
                        "Spent",
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      fill="url(#analyticsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Category breakdown */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium">
                Spending by category
              </p>

              <p className="mt-1 text-xs text-white/30">
                Where your money went
              </p>
            </div>

            {dashboard.categoryBreakdown.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center">
                <EmptyChart />
              </div>
            ) : (
              <>
                <div className="relative mx-auto mt-4 h-[240px] max-w-[300px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={dashboard.categoryBreakdown}
                        dataKey="percentage"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {dashboard.categoryBreakdown.map(
                          (category) => (
                            <Cell
                              key={category.categoryId}
                              fill={
                                category.color ||
                                "#a78bfa"
                              }
                            />
                          ),
                        )}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold">
                      ₹
                      {dashboard.summary.thisMonth.toLocaleString(
                        "en-IN",
                      )}
                    </span>

                    <span className="mt-1 text-[10px] text-white/30">
                      Total spent
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.categoryBreakdown
                    .slice(0, 6)
                    .map((category) => (
                      <div
                        key={category.categoryId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                category.color ||
                                "#a78bfa",
                            }}
                          />

                          <span className="truncate text-sm text-white/60">
                            {category.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/30">
                            ₹
                            {Number(
                              category.amount,
                            ).toLocaleString("en-IN")}
                          </span>

                          <span className="w-10 text-right text-xs font-medium">
                            {category.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Category ranking */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium">
              Category breakdown
            </p>

            <p className="mt-1 text-xs text-white/30">
              Ranked by spending for {monthLabel}
            </p>
          </div>

          {dashboard.categoryBreakdown.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
              <p className="text-sm text-white/40">
                No expenses for this month.
              </p>

              <p className="mt-1 text-xs text-white/20">
                Add a transaction to start seeing analytics.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1fr_140px_120px] border-b border-white/[0.06] px-4 pb-3 text-[10px] uppercase tracking-wider text-white/25">
                  <span>Category</span>
                  <span>Amount</span>
                  <span>Share</span>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {[...dashboard.categoryBreakdown]
                    .sort(
                      (a, b) =>
                        Number(b.amount) -
                        Number(a.amount),
                    )
                    .map((category, index) => (
                      <div
                        key={category.categoryId}
                        className="grid grid-cols-[1fr_140px_120px] items-center px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-xs text-white/20">
                            {String(index + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <div
                            className="h-8 w-8 rounded-lg"
                            style={{
                              backgroundColor: `${
                                category.color ||
                                "#a78bfa"
                              }20`,
                            }}
                          />

                          <span className="text-sm">
                            {category.name}
                          </span>
                        </div>

                        <span className="text-sm text-white/60">
                          ₹
                          {Number(
                            category.amount,
                          ).toLocaleString("en-IN")}
                        </span>

                        <span className="text-sm text-white/40">
                          {category.percentage}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 transition hover:border-white/[0.14]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/60">
          {icon}
        </div>

        <span className="text-xs text-white/40">
          {title}
        </span>
      </div>

      <p className="mt-6 truncate text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 truncate text-[10px] text-white/25">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
        <ArrowDownRight className="h-5 w-5 text-white/20" />
      </div>

      <p className="mt-3 text-sm text-white/30">
        Not enough data yet
      </p>
    </div>
  );
}