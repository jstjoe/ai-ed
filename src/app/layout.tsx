import type { Metadata } from "next";
import Link from "next/link";
import "../styles/globals.css";
import { ConfettiProvider } from "@/components/Confetti";

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Personal task tracker with kanban + What's next",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ConfettiProvider>
          <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
              <Link href="/" className="font-semibold">
                Task Tracker
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Board
                </Link>
                <Link
                  href="/whats-next"
                  className="text-muted-foreground hover:text-foreground"
                >
                  What&apos;s next
                </Link>
                <Link
                  href="/settings"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </ConfettiProvider>
      </body>
    </html>
  );
}
