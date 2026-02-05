import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {/* Hero section */}
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-8">
          {/* Mobile avatar */}
          <div className="md:hidden flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          {/* Name and title */}
          <div className="space-y-1.5">
            <Skeleton className="h-10 md:h-12 w-48 md:w-64" />
            <Skeleton className="h-6 w-40" />
          </div>
          {/* Bio */}
          <div className="space-y-2 max-w-xl">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          {/* Social links */}
          <div className="flex gap-2.5 pt-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        {/* Desktop avatar */}
        <div className="hidden md:block flex-shrink-0">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </div>

      {/* Selected Projects - matches home.tsx list style */}
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3 border-b border-border/50">
              <Skeleton className="h-5 w-48 mb-1.5" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Writing - matches home.tsx list style */}
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-baseline justify-between py-3 border-b border-border/50">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WritingSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 md:h-9 w-32" />
        <Skeleton className="h-6 w-80" />
      </div>

      {/* Year sections - matches writing.tsx */}
      <div className="space-y-10">
        {[2024, 2023].map((year) => (
          <div key={year} className="space-y-4">
            <Skeleton className="h-4 w-12 ml-1" />
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-baseline justify-between py-3 border-b border-border/40">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-14 ml-4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 md:h-9 w-32" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Project list - matches projects.tsx simple list */}
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-4 border-b border-border/40">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Back link */}
      <Skeleton className="h-4 w-20" />

      {/* Title */}
      <Skeleton className="h-9 md:h-10 w-3/4" />

      {/* Meta */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Content lines */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}

export function TravelSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.40))] animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="space-y-2 flex-shrink-0">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-6 w-80" />
      </div>

      {/* Map placeholder */}
      <div className="flex-1 min-h-0 mt-6 flex flex-col">
        <Skeleton className="flex-1 min-h-[280px] rounded-lg" />
        <Skeleton className="h-4 w-64 mt-4" />
      </div>
    </div>
  );
}

export function WorkSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.40))] animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="space-y-2 flex-shrink-0">
        <Skeleton className="h-8 md:h-9 w-20" />
        <Skeleton className="h-6 w-80" />
      </div>

      {/* Work entries - matches work.tsx grid layout */}
      <div className="space-y-6 md:space-y-8 mt-8 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-3 sm:gap-x-4 items-start">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
