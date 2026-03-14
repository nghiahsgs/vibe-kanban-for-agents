"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="w-[300px] min-w-[300px] flex-shrink-0 rounded-2xl bg-muted border border-border"
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5 mb-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="ml-auto h-4 w-6 rounded-full" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
          <div className="px-3 pb-3 space-y-2.5 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[100px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
