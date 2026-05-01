"use client";

import confetti from "canvas-confetti";
import { createContext, useCallback, useContext, useMemo } from "react";

type ConfettiCtx = {
  fire: (variant?: "done" | "cancelled") => void;
};

const Ctx = createContext<ConfettiCtx | null>(null);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const fire = useCallback((variant: "done" | "cancelled" = "done") => {
    if (typeof window === "undefined") return;
    const colors =
      variant === "done"
        ? ["#22c55e", "#16a34a", "#fbbf24", "#3b82f6"]
        : ["#71717a", "#a1a1aa", "#fbbf24"];
    confetti({
      particleCount: variant === "done" ? 120 : 60,
      spread: 80,
      startVelocity: 45,
      origin: { y: 0.7 },
      colors,
    });
    if (variant === "done") {
      setTimeout(
        () =>
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors,
          }),
        150
      );
      setTimeout(
        () =>
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors,
          }),
        220
      );
    }
  }, []);

  const value = useMemo(() => ({ fire }), [fire]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfetti() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfetti must be used inside ConfettiProvider");
  return ctx;
}
