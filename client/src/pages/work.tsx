import { useContent } from "@/lib/content-context";
import { formatYearRange } from "@/lib/utils";

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

      <div className="space-y-14 md:space-y-20">
        {sortedWorkHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No work experience added yet.
          </p>
        ) : (
          sortedWorkHistory.map((item) => (
            <div key={item.id} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-4 sm:gap-x-10" data-testid={`work-${item.id}`}>
              <div className="text-sm text-muted-foreground/70 font-mono uppercase tracking-wider whitespace-nowrap">
                {formatYearRange(item.startDate, item.endDate)}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-medium text-primary tracking-tight">
                  {item.company}
                </h3>
                <div className="text-sm font-medium text-muted-foreground">
                  {item.role}
                </div>
                <p className="text-muted-foreground leading-7 text-[15px] whitespace-pre-line">
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
