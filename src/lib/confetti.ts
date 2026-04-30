import confetti from 'canvas-confetti';
import type { TerminalKind } from '../data/types';

export function fireForTransition(from: TerminalKind, to: TerminalKind): void {
  if (to === null) return;
  if (from === to) return;

  if (to === 'done') {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'],
    });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
    }, 150);
  } else {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#9ca3af'],
      gravity: 1.4,
      ticks: 120,
    });
  }
}
