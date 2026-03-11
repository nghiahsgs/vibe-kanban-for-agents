"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div key={colIdx} className="w-72 shrink-0 rounded-lg bg-muted/30 p-3">
          <Skeleton className="h-5 w-24 mb-4" />
          {Array.from({ length: 2 + colIdx % 2 }).map((_, cardIdx) => (
            <Skeleton key={cardIdx} className="h-20 w-full mb-2 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
