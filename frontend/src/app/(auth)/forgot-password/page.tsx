"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { authApi } from "@/features/auth/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);

      setSuccess(
        response?.message ||
          "If an account exists with this email, a reset link has been sent.",
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password."
      description="Enter your email and we'll send you a secure password reset link."
      footer={
        <>
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-white hover:text-violet-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

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

        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}