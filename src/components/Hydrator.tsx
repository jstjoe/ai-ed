"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function Hydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
