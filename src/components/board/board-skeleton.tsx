"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="min-w-[260px] flex-1 rounded-2xl border border-border/60 bg-muted/60 dark:bg-white/[0.04]"
        >
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/40">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-5 w-5 rounded-full" />
          </div>
          <div className="p-3 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[72px] w-full mb-2.5 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
