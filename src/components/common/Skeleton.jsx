export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className}`}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="rounded-xl p-4 md:p-5 border border-border bg-card mb-4 animate-pulse">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <div className="pt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex space-x-4 pt-3">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
      <Skeleton className="h-32 sm:h-40 w-full rounded-none" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="rounded-xl p-4 border border-border bg-card animate-pulse">
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Events Section Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Posts & Activities Section Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/5">
          <Skeleton className="h-6 w-20 mb-4" />
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
        <div className="w-full lg:w-2/5">
          <Skeleton className="h-6 w-24 mb-4" />
          <ActivitySkeleton />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
