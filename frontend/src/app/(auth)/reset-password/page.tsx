"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { authApi } from "@/features/auth/auth.api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(
        token,
        password,
      );

      setSuccess(
        response?.message ||
          "Password reset successfully.",
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create a new password."
      description="Choose a strong password to secure your SpendWise account."
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
            New password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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

        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">
            Confirm password
          </label>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repeat your password"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 pr-11 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/50 focus:bg-white/[0.04]"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              Reset password
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}