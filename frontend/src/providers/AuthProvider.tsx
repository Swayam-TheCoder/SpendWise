"use client";

import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/features/auth/auth.store";
import { configureApiAuth } from "@/lib/api/client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const refresh = useAuthStore((state) => state.refresh);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return;

  initialized.current = true;

  configureApiAuth({
    getAccessToken: () => useAuthStore.getState().accessToken,

    setAuth: (accessToken, user) =>
      useAuthStore.getState().setAuth(accessToken, user),

    clearAuth: () => useAuthStore.getState().clearAuth(),
  });

  refresh().finally(() => {
    setCheckingAuth(false);
  });
}, [refresh]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-3 text-lg font-semibold">SpendWise</div>

          <div className="text-sm text-white/50">
            Checking your session...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}