-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "statusId" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "position" REAL NOT NULL,
    "completedAt" DATETIME,
    "ownerId" TEXT NOT NULL DEFAULT 'local',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Task_statusId_position_idx" ON "Task"("statusId", "position");
