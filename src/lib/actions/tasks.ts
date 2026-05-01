"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as repo from "../db/tasks";
import { DURATIONS, PRIORITIES } from "../duration";

const durationSchema = z.enum(DURATIONS);
const prioritySchema = z.enum(PRIORITIES);

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  statusId: z.string().min(1),
  duration: durationSchema,
  priority: prioritySchema.default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
});

export type CreateTaskInput = z.input<typeof createSchema>;

export async function createTaskAction(input: CreateTaskInput) {
  const parsed = createSchema.parse(input);
  const task = await repo.createTask({
    title: parsed.title,
    description: parsed.description || undefined,
    statusId: parsed.statusId,
    duration: parsed.duration,
    priority: parsed.priority,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
  });
  revalidatePath("/");
  revalidatePath("/whats-next");
  return task;
}

const updateSchema = createSchema.partial().extend({ id: z.string().min(1) });
export type UpdateTaskInput = z.input<typeof updateSchema>;

export async function updateTaskAction(input: UpdateTaskInput) {
  const parsed = updateSchema.parse(input);
  const { id, dueDate, description, ...rest } = parsed;
  const task = await repo.updateTask(id, {
    ...rest,
    description: description === "" ? null : description,
    dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
  });
  revalidatePath("/");
  revalidatePath("/whats-next");
  return task;
}

export async function deleteTaskAction(id: string) {
  await repo.deleteTask(z.string().min(1).parse(id));
  revalidatePath("/");
  revalidatePath("/whats-next");
}

const moveSchema = z.object({
  id: z.string().min(1),
  targetStatusId: z.string().min(1),
  targetIndex: z.number().int().min(0),
});

export async function moveTaskAction(input: z.input<typeof moveSchema>) {
  const parsed = moveSchema.parse(input);
  const result = await repo.moveTask(parsed);
  revalidatePath("/");
  revalidatePath("/whats-next");
  return {
    taskId: result.task.id,
    statusKind: result.statusKind,
    celebrate:
      result.statusKind === "DONE" || result.statusKind === "CANCELLED",
  };
}
