import { useWorkExperiences, useProfile } from "@/lib/content-hooks";
import { formatYearRange } from "@/lib/utils";
import { WorkSkeleton } from "@/components/skeletons/PageSkeletons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Work() {
  useDocumentTitle("Work");
  const { workHistory, isLoading: workLoading } = useWorkExperiences();
  const { profile, isLoading: profileLoading } = useProfile();
  const isLoading = workLoading || profileLoading;

  if (isLoading || !profile) {
    return <WorkSkeleton />;
  }

  const sortedWorkHistory = [...workHistory].sort((a, b) => {
    const getEndDateForSort = (endDate: string) => {
      if (!endDate || endDate.toLowerCase() === 'present') return new Date();
      const date = new Date(endDate);
      return isNaN(date.getTime()) ? new Date(0) : date;
    };

    const endDateA = getEndDateForSort(a.endDate);
    const endDateB = getEndDateForSort(b.endDate);
    return endDateB.getTime() - endDateA.getTime();
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.40))]">
      <div className="space-y-2 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Work</h1>
        <p className="text-muted-foreground text-lg">
          My career journey and the teams I've been lucky to work with.
        </p>
      </div>

      <div className="space-y-6 md:space-y-8 mt-8 flex-1">
        {sortedWorkHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No work experience added yet.
          </p>
        ) : (
          sortedWorkHistory.map((item) => (
            <div key={item.id} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-3 sm:gap-x-4 items-start sm:items-baseline" data-testid={`work-${item.id}`}>
              <div className="text-sm text-muted-foreground/70 font-mono uppercase tracking-wider whitespace-nowrap">
                {formatYearRange(item.startDate, item.endDate)}
              </div>
              <div className="flex flex-col gap-2 sm:self-baseline">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg md:text-xl font-medium text-primary tracking-tight">
                    {item.company}
                  </h3>
                  <span className="text-muted-foreground/40">·</span>
                  <div className="text-sm text-muted-foreground">
                    {item.role}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {profile.email && profile.showEmail && (
        <div className="pt-6 border-t mt-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground mb-4">
            I'm occasionally open to consulting work or speaking engagements.
          </p>
          <a href={`mailto:${profile.email}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" data-testid="button-contact">
            Get in touch
          </a>
        </div>
      )}
    </div>
  );
}
