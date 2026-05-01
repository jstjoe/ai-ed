import { describe, it, expect } from "vitest";
import { rankTasks, type RankableTask } from "./whatsnext";

function makeTask(overrides: Partial<RankableTask> = {}): RankableTask {
  return {
    id: Math.random().toString(36).slice(2),
    title: "test",
    duration: "FIFTEEN_MIN",
    priority: "MEDIUM",
    dueDate: null,
    statusKind: "ACTIVE",
    ...overrides,
  };
}

describe("rankTasks", () => {
  it("excludes tasks longer than the slot", () => {
    const tasks: RankableTask[] = [
      makeTask({ id: "a", duration: "FIVE_MIN" }),
      makeTask({ id: "b", duration: "THIRTY_MIN" }),
    ];
    const ranked = rankTasks({ tasks, slotMinutes: 5 });
    expect(ranked.map((t) => t.id)).toEqual(["a"]);
  });

  it("excludes done/cancelled tasks", () => {
    const tasks: RankableTask[] = [
      makeTask({ id: "a", duration: "FIVE_MIN", statusKind: "DONE" }),
      makeTask({ id: "b", duration: "FIVE_MIN", statusKind: "CANCELLED" }),
      makeTask({ id: "c", duration: "FIVE_MIN", statusKind: "ACTIVE" }),
    ];
    const ranked = rankTasks({ tasks, slotMinutes: 5 });
    expect(ranked.map((t) => t.id)).toEqual(["c"]);
  });

  it("ranks overdue HIGH above non-overdue HIGH", () => {
    const now = new Date("2025-06-15");
    const tasks: RankableTask[] = [
      makeTask({
        id: "future",
        priority: "HIGH",
        dueDate: new Date("2025-06-30"),
      }),
      makeTask({
        id: "overdue",
        priority: "HIGH",
        dueDate: new Date("2025-06-10"),
      }),
    ];
    const ranked = rankTasks({ tasks, slotMinutes: 60, now });
    expect(ranked[0].id).toBe("overdue");
  });

  it("excludes UNKNOWN duration from short slots", () => {
    const tasks: RankableTask[] = [makeTask({ id: "u", duration: "UNKNOWN" })];
    expect(rankTasks({ tasks, slotMinutes: 15 })).toHaveLength(0);
  });

  it("includes UNKNOWN in 30+ slots but deprioritizes vs same-priority known", () => {
    const tasks: RankableTask[] = [
      makeTask({ id: "u", duration: "UNKNOWN", priority: "MEDIUM" }),
      makeTask({ id: "k", duration: "THIRTY_MIN", priority: "MEDIUM" }),
    ];
    const ranked = rankTasks({ tasks, slotMinutes: 30 });
    expect(ranked.map((t) => t.id)).toEqual(["k", "u"]);
  });

  it("respects limit", () => {
    const tasks: RankableTask[] = Array.from({ length: 10 }, (_, i) =>
      makeTask({ id: `t${i}`, duration: "FIVE_MIN" })
    );
    const ranked = rankTasks({ tasks, slotMinutes: 5, limit: 3 });
    expect(ranked).toHaveLength(3);
  });
});
