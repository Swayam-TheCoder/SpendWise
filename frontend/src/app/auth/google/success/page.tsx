"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/auth.store";

export default function GoogleSuccessPage() {
  const router = useRouter();

  const refresh = useAuthStore((state) => state.refresh);

  const [error, setError] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;

    hasStarted.current = true;

    const authenticate = async () => {
      try {
        const success = await refresh();

        if (success) {
          router.replace("/dashboard");
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Google login completion failed:", error);
        setError(true);
      }
    };

    authenticate();
  }, [refresh, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Google login failed</h1>

          <p className="mt-2 text-sm text-white/60">
            Please try signing in again.
          </p>

          <button
            onClick={() => router.replace("/login")}
            className="mt-4 underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <p>Signing you in...</p>
    </div>
  );
}
