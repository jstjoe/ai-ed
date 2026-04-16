import confetti from 'canvas-confetti';

export function useConfetti() {
  const fire = (isDone: boolean) => {
    if (isDone) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#86efac', '#bbf7d0', '#fbbf24', '#f59e0b'],
      });
    } else {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#94a3b8', '#cbd5e1', '#f87171', '#fca5a5'],
        scalar: 0.8,
      });
    }
  };

  return { fire };
}
