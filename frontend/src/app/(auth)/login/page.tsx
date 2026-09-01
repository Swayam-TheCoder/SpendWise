"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Backend integration will be connected here.
      console.log({
        email,
        password,
      });

      // TEMP:
      // After API integration:
      // router.push("/dashboard");

    } catch (error) {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to continue managing your money with SpendWise."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-white hover:text-violet-300"
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">
            Email
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/50 focus:bg-white/[0.04]"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-white/60">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] text-white/30 transition hover:text-violet-300"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 pr-11 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/50 focus:bg-white/[0.04]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Login */}
        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-white/[0.07]" />

          <span className="text-[9px] uppercase tracking-widest text-white/20">
            or
          </span>

          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.02] text-sm font-medium text-white/70 transition hover:bg-white/[0.05] hover:text-white"
        >
          <span className="text-base font-bold">G</span>
          Continue with Google
        </button>

      </form>
    </AuthShell>
  );
}