/** Client-side fractional indexing — no DB imports */
const POSITION_GAP = 1000;

export function calculateMidPosition(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return POSITION_GAP;
  if (before === null) return after! / 2;
  if (after === null) return before + POSITION_GAP;
  return (before + after) / 2;
}
