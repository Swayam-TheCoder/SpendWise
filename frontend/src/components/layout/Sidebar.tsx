"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  BarChart3,
  FileText,
  Settings,
  Shield,
  LogOut,
  CircleDollarSign,
} from "lucide-react";

const navigation = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Money",
    items: [
      {
        label: "Transactions",
        href: "/transactions",
        icon: Receipt,
      },
      {
        label: "Budgets",
        href: "/budgets",
        icon: Wallet,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Tags,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        label: "Security",
        href: "/security",
        icon: Shield,
      },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <CircleDollarSign className="h-7 w-7" />

        <span className="text-xl font-bold">
          SpendWise
        </span>
      </div>

      <nav className="flex-1 space-y-6 p-4">
        {navigation.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    <Icon className="h-4 w-4" />

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}