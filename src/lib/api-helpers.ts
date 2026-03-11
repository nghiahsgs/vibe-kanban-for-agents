import { NextResponse } from "next/server";
import type { ApiError } from "@/types";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  status: number,
  title: string,
  detail: string,
  instance?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      type: `https://kanban.local/errors/${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      detail,
      instance,
    },
    { status }
  );
}

/** Validate required fields; returns error string or null */
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!body[field] && body[field] !== 0) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

const VALID_STATUSES = ["todo", "in_progress", "review", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

export function validateTaskFields(
  body: Record<string, unknown>
): string | null {
  if (body.status && !VALID_STATUSES.includes(body.status as string)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
    return `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`;
  }
  if (
    body.title !== undefined &&
    typeof body.title === "string" &&
    body.title.trim() === ""
  ) {
    return "Title cannot be empty";
  }
  return null;
}
