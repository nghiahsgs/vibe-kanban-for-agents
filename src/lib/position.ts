import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { TaskStatus } from "@/types";

const POSITION_GAP = 1000;

/** Get next position for appending to end of a column, optionally scoped to a board */
export async function getNextPosition(status: TaskStatus, boardId?: string): Promise<number> {
  const conditions = [eq(tasks.status, status)];
  if (boardId) conditions.push(eq(tasks.boardId, boardId));

  const [last] = await db
    .select({ position: tasks.position })
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.position))
    .limit(1);

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
