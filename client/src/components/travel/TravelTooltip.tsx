import { format } from "date-fns";

interface TravelTooltipProps {
  countryName: string;
  visits: string[];
  position?: { x: number; y: number };
}

export function TravelTooltip({ countryName, visits, position }: TravelTooltipProps) {
  const formatVisitDate = (dateStr: string) => {
    try {
      const [year, month] = dateStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, "MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const formattedVisits = visits.map(formatVisitDate);

  return (
    <div className="px-4 py-3 min-w-[160px] bg-popover border border-border rounded-md shadow-lg backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200">
      <div className="font-medium text-sm text-foreground mb-2 tracking-tight">
        {countryName}
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
        {visits.length === 0 ? (
          <span className="italic text-muted-foreground/80">Home country</span>
        ) : visits.length === 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
            <span>{formattedVisits[0]}</span>
          </div>
        ) : visits.length <= 3 ? (
          <div className="space-y-1.5">
            {formattedVisits.map((date, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0"></span>
                <span>{date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {formattedVisits.slice(0, 3).map((date, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0"></span>
                <span>{date}</span>
              </div>
            ))}
            <div className="text-muted-foreground/70 mt-1 pt-1 border-t border-border/50">
              +{visits.length - 3} more visit{visits.length - 3 > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
