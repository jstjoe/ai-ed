import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#22c55e', '#86efac', '#bbf7d0'],
    });
  }, 200);
}
