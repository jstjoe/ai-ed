"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as repo from "../db/statuses";
import { STATUS_KINDS, type StatusKind } from "../duration";

const kindSchema = z.enum(STATUS_KINDS);
const colorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/i, "Color must be a hex code like #3b82f6");

const createSchema = z.object({
  name: z.string().min(1).max(40),
  color: colorSchema,
  kind: kindSchema,
});

export async function createStatusAction(input: z.input<typeof createSchema>) {
  const parsed = createSchema.parse(input);
  const result = await repo.createStatus(parsed);
  revalidatePath("/");
  revalidatePath("/settings");
  return result;
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(40).optional(),
  color: colorSchema.optional(),
  kind: kindSchema.optional(),
});

export async function updateStatusAction(input: z.input<typeof updateSchema>) {
  const { id, ...rest } = updateSchema.parse(input);

  // Changing a status's kind must not violate the
  // "at least one of each kind" invariant.
  if (rest.kind) {
    const target = await repo.getStatus(id);
    if (!target) throw new Error("Status not found.");
    if (target.kind !== rest.kind) {
      const counts = await repo.countStatusesByKind();
      if (counts[target.kind as StatusKind] <= 1) {
        throw new Error(
          `At least one ${KIND_LABEL[target.kind as StatusKind]} status is required.`
        );
      }
    }
  }

  const result = await repo.updateStatus(id, rest);
  revalidatePath("/");
  revalidatePath("/settings");
  return result;
}

export async function reorderStatusesAction(orderedIds: string[]) {
  const ids = z.array(z.string().min(1)).parse(orderedIds);
  await repo.reorderStatuses(ids);
  revalidatePath("/");
  revalidatePath("/settings");
}

const deleteSchema = z.object({
  id: z.string().min(1),
  reassignTo: z.string().min(1).optional(),
});

const KIND_LABEL: Record<StatusKind, string> = {
  ACTIVE: "Active",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export async function deleteStatusAction(input: z.input<typeof deleteSchema>) {
  const parsed = deleteSchema.parse(input);

  const target = await repo.getStatus(parsed.id);
  if (!target) throw new Error("Status not found.");

  // Enforce: at least one status of each kind must remain.
  const counts = await repo.countStatusesByKind();
  if (counts[target.kind as StatusKind] <= 1) {
    throw new Error(
      `At least one ${KIND_LABEL[target.kind as StatusKind]} status is required.`
    );
  }

  await repo.deleteStatus(parsed.id, parsed.reassignTo);
  revalidatePath("/");
  revalidatePath("/settings");
}
