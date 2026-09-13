"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/features/auth/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isAuthChecked = useAuthStore(
    (state) => state.isAuthChecked,
  );

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthChecked, isAuthenticated, router]);

  // Auth status decide hone tak dashboard render mat karo
  if (!isAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-white/50">
          Checking your session...
        </p>
      </div>
    );
  }

  // Not authenticated: redirect hone tak blank
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}