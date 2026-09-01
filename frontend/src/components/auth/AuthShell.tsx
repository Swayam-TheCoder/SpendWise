"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footer: React.ReactNode;
}

export default function AuthShell({
  children,
  title,
  description,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT */}
        <section className="relative hidden overflow-hidden border-r border-white/[0.08] lg:block">

          {/* Background glow */}
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[140px]" />

          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[140px]" />

          <div className="relative flex min-h-screen flex-col p-10 xl:p-14">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight">
                  SpendWise
                </p>

                <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Finance OS
                </p>
              </div>
            </Link>

            {/* Hero */}
            <div className="mt-auto mb-auto max-w-xl pt-20">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-violet-300">
                <Sparkles className="h-3 w-3" />
                Smarter money management
              </div>

              <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Your money.
                <br />
                <span className="text-white/35">
                  Your decisions.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/35">
                Track every rupee, understand your spending,
                and build better financial habits with SpendWise.
              </p>

              {/* Mini dashboard */}
              <div className="relative mt-12 max-w-md overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5 shadow-2xl">

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-[70px]" />

                <div className="relative">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">
                        Total balance
                      </p>

                      <p className="mt-2 text-3xl font-semibold">
                        ₹42,850
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                      <Wallet className="h-4 w-4 text-white/60" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      12.8%
                    </span>

                    <span className="text-[10px] text-white/25">
                      vs last month
                    </span>
                  </div>

                  <div className="mt-7 flex h-20 items-end gap-1.5">
                    {[35, 50, 42, 70, 55, 75, 65, 90, 72, 100].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500/10 to-violet-400/50"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>

                </div>
              </div>

              {/* Trust points */}
              <div className="mt-8 flex flex-wrap gap-5">

                <div className="flex items-center gap-2 text-[10px] text-white/35">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Secure
                </div>

                <div className="flex items-center gap-2 text-[10px] text-white/35">
                  <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
                  Smart insights
                </div>

                <div className="flex items-center gap-2 text-[10px] text-white/35">
                  <Wallet className="h-3.5 w-3.5 text-fuchsia-400" />
                  Full control
                </div>

              </div>
            </div>

            <p className="text-[10px] text-white/20">
              © 2026 SpendWise · Finance OS
            </p>

          </div>
        </section>

        {/* RIGHT */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">

          {/* Mobile logo */}
          <Link
            href="/"
            className="absolute left-6 top-6 flex items-center gap-2 lg:hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Wallet className="h-4 w-4" />
            </div>

            <span className="font-semibold">
              SpendWise
            </span>
          </Link>

          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative w-full max-w-[430px]">

            <div className="mb-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-violet-400">
                Finance OS
              </p>

              <h1 className="text-3xl font-semibold tracking-tight">
                {title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/35">
                {description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              {children}
            </div>

            <div className="mt-6 text-center text-xs text-white/30">
              {footer}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}