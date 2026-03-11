"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="w-[280px] shrink-0 rounded-xl border border-border/40 bg-muted/40 dark:bg-muted/20"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-5 w-5 rounded-full" />
          </div>
          <div className="p-2 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[60px] w-full mb-2 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
