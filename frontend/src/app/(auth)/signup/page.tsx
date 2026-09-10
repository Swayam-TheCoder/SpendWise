"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/auth.store";

import AuthShell from "@/components/auth/AuthShell";
import { authApi } from "@/features/auth/auth.api";

export default function SignupPage() {
  const router = useRouter();

  const signup = useAuthStore((state) => state.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await signup(name, email, password);

      console.log("Signup successful:", response);

      router.push("/login?registered=true");
    } catch (error: any) {
  setError(
    error?.response?.data?.message ||
      "Unable to create your account.",
  );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account."
      description="Start building better financial habits with SpendWise."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white hover:text-violet-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">
            Full name
          </label>

          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm outline-none placeholder:text-white/20 focus:border-violet-400/50"
          />
        </div>

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
            className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm outline-none placeholder:text-white/20 focus:border-violet-400/50"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 pr-11 text-sm outline-none placeholder:text-white/20 focus:border-violet-400/50"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-1 flex-1 rounded-full bg-white/[0.08]"
              />
            ))}
          </div>

          <p className="mt-2 text-[10px] text-white/25">
            Use a strong password with letters, numbers and symbols.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
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

        <button
          type="button"
          onClick={authApi.googleLogin}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.02] text-sm font-medium text-white/70 transition hover:bg-white/[0.05] hover:text-white"
        >
          <span className="text-base font-bold">G</span>
          Continue with Google
        </button>

        <p className="pt-2 text-center text-[10px] leading-5 text-white/20">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </form>
    </AuthShell>
  );
}
