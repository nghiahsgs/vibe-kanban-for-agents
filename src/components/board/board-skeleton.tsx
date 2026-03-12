"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="min-w-[280px] flex-1 rounded-xl border border-border bg-card/50"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="ml-auto h-4 w-5 rounded-md" />
          </div>
          <div className="p-2.5 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[64px] w-full mb-2 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
