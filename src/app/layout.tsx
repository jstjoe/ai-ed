import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Hydrator } from "@/components/Hydrator";
import { ConfettiHost } from "@/components/Confetti";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Personal task tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Hydrator>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <header className="mb-6 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">
                Tasks
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link
                  href="/"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Board
                </Link>
                <Link
                  href="/settings"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Settings
                </Link>
              </nav>
            </header>
            {children}
          </div>
          <ConfettiHost />
        </Hydrator>
      </body>
    </html>
  );
}
