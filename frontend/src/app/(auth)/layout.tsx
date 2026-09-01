import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>

            SpendWise
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}