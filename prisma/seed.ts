import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_STATUSES = [
  { name: "Backlog", color: "#64748b", order: 0, kind: "ACTIVE" },
  { name: "To Do", color: "#3b82f6", order: 1, kind: "ACTIVE" },
  { name: "In Progress", color: "#f59e0b", order: 2, kind: "ACTIVE" },
  { name: "Blocked", color: "#ef4444", order: 3, kind: "ACTIVE" },
  { name: "Done", color: "#22c55e", order: 4, kind: "DONE" },
  { name: "Cancelled", color: "#71717a", order: 5, kind: "CANCELLED" },
];

async function main() {
  const existing = await prisma.status.count();
  if (existing > 0) {
    console.log(`Statuses already seeded (${existing} rows). Skipping.`);
    return;
  }
  for (const s of DEFAULT_STATUSES) {
    await prisma.status.create({ data: s });
  }
  console.log(`Seeded ${DEFAULT_STATUSES.length} default statuses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
