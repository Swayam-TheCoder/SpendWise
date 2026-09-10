"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/auth.store";
import { authApi } from "@/features/auth/auth.api";

export default function SettingsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } catch {
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your SpendWise account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleting(true);

    try {
      await authApi.deleteAccount();

      clearAuth();

      router.replace("/login");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete your account.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Manage your SpendWise account.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Account */}

        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6">
          <h2 className="text-sm font-medium">
            Account
          </h2>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <p className="text-sm font-medium">
                {user?.name}
              </p>

              <p className="mt-1 text-xs text-white/30">
                {user?.email}
              </p>
            </div>
          </div>
        </section>

        {/* Session */}

        <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0b0b0b] p-6">
          <h2 className="text-sm font-medium">
            Session
          </h2>

          <p className="mt-2 text-xs text-white/30">
            Sign out from your current SpendWise session.
          </p>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] px-4 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            {loggingOut
              ? "Signing out..."
              : "Log out"}
          </button>
        </section>

        {/* Danger Zone */}

        <section className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.025] p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-400" />

            <div>
              <h2 className="text-sm font-medium text-rose-300">
                Danger zone
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/35">
                Permanently delete your SpendWise account.
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-rose-500/30 px-4 text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {deleting
              ? "Deleting account..."
              : "Delete account"}
          </button>
        </section>
      </div>
    </div>
  );
}