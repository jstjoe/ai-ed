import confetti from 'canvas-confetti';

export function useConfetti() {
  const celebrate = (type: 'done' | 'cancelled' = 'done') => {
    if (type === 'done') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
      });
    } else {
      // Softer grey confetti for cancelled
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#94a3b8', '#cbd5e1', '#64748b'],
        gravity: 1.5,
      });
    }
  };

  return { celebrate };
}
