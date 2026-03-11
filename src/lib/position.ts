import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { TaskStatus } from "@/types";

const POSITION_GAP = 1000;

/** Get next position for appending to end of a column */
export function getNextPosition(status: TaskStatus): number {
  const last = db
    .select({ position: tasks.position })
    .from(tasks)
    .where(eq(tasks.status, status))
    .orderBy(desc(tasks.position))
    .limit(1)
    .get();

  return last ? last.position + POSITION_GAP : POSITION_GAP;
}

/** Calculate midpoint between two positions for fractional indexing */
export function calculateMidPosition(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return POSITION_GAP;
  if (before === null) return after! / 2;
  if (after === null) return before + POSITION_GAP;
  return (before + after) / 2;
}
