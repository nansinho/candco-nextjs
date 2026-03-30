import { Skeleton } from "@/components/ui/skeleton";

export default function FormationsLoading() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div className="sticky top-16 z-40 bg-[#151F2D] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-60 bg-white/5 rounded-lg" />
            <div className="w-px h-6 bg-white/10" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-16 sm:py-20 bg-[#151F2D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-5 w-40 bg-white/5 mb-8" />
          <div className="space-y-16">
            {Array.from({ length: 2 }).map((_, poleIdx) => (
              <div key={poleIdx}>
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40 bg-white/5" />
                    <Skeleton className="h-4 w-24 bg-white/5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white/5">
                      <Skeleton className="aspect-[3/1] bg-white/5" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                        <Skeleton className="h-4 w-full bg-white/5" />
                        <div className="flex justify-between pt-3">
                          <Skeleton className="h-6 w-20 bg-white/10" />
                          <Skeleton className="h-4 w-16 bg-white/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
