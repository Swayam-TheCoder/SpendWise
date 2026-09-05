"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/auth.store";

export default function GoogleSuccessPage() {
  const router = useRouter();

  const refresh = useAuthStore(
    (state) => state.refresh
  );

  const [error, setError] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      const success = await refresh();

      if (success) {
        router.replace("/dashboard");
      } else {
        setError(true);
      }
    };

    authenticate();
  }, [refresh, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Google login failed
          </h1>

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
    <div className="flex min-h-screen items-center justify-center">
      <p>Signing you in...</p>
    </div>
  );
}

// Step 10