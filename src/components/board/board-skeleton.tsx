"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="w-[300px] min-w-[300px] flex-shrink-0 rounded-2xl bg-[#161d2e] border border-[#1e2a3d]"
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5 mb-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <Skeleton className="h-3.5 w-20 bg-white/10" />
              <Skeleton className="ml-auto h-5 w-7 rounded-full bg-white/5" />
            </div>
            <Skeleton className="h-1 w-full rounded-full bg-white/5" />
          </div>
          <div className="px-3 pb-3 space-y-2.5 min-h-[200px]">
            {Array.from({ length: 2 + (colIdx % 2) }).map((_, cardIdx) => (
              <Skeleton key={cardIdx} className="h-[120px] w-full rounded-xl bg-[#1e2535]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
