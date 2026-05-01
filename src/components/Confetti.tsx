"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useStore } from "@/lib/store";

export function ConfettiHost() {
  const lastCompletion = useStore((s) => s.lastCompletion);
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastCompletion) return;
    const key = `${lastCompletion.taskId}:${lastCompletion.kind}`;
    if (seenRef.current === key) return;
    seenRef.current = key;

    if (lastCompletion.kind === "done") {
      confetti({
        particleCount: 120,
        spread: 75,
        startVelocity: 45,
        origin: { y: 0.7 },
        colors: ["#22c55e", "#16a34a", "#fde047", "#60a5fa", "#a855f7"],
      });
    } else {
      confetti({
        particleCount: 80,
        spread: 60,
        startVelocity: 35,
        origin: { y: 0.7 },
        colors: ["#ef4444", "#f97316", "#737373"],
        scalar: 0.9,
      });
    }
  }, [lastCompletion]);

  return null;
}
