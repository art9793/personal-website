import { useContent } from "@/lib/content-context";
import { formatDateRange } from "@/lib/utils";

export default function Work() {
  const { workHistory, profile, isLoading } = useContent();

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Work</h1>
        <p className="text-muted-foreground text-lg">
          My career journey and the teams I've been lucky to work with.
        </p>
      </div>

      <div className="space-y-8">
        {sortedWorkHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No work experience added yet.
          </p>
        ) : (
          sortedWorkHistory.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 group p-2 -mx-2 rounded-lg hover:bg-secondary/40 transition-colors" data-testid={`work-${item.id}`}>
              <div className="w-48 flex-shrink-0 text-xs text-muted-foreground font-mono whitespace-nowrap">
                {formatDateRange(item.startDate, item.endDate)}
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-lg font-semibold text-primary transition-colors">
                  {item.company}
                </h3>
                <div className="text-sm font-medium text-primary/80 mb-1">
                  {item.role}
                </div>
                <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {profile.email && profile.showEmail && (
        <div className="pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Contact</h2>
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
