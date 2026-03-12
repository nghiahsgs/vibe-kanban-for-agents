"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="min-w-[280px] flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02]"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.06]">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="ml-auto h-4 w-5 rounded" />
          </div>
          <div className="p-2.5 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[60px] w-full mb-2 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
