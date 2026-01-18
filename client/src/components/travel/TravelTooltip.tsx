interface TravelTooltipProps {
  countryName: string;
  visits: string[];
  isHomeCountry?: boolean;
}

export function TravelTooltip({ countryName, visits, isHomeCountry = false }: TravelTooltipProps) {
  // Get display value: "Home", "n/a", or comma-separated years (e.g., "2019, 2024")
  const getDisplayValue = (): string => {
    // Home country always shows "Home"
    if (isHomeCountry) {
      return "Home";
    }
    
    if (visits.length === 0) {
      return "n/a";
    }
    
    // Extract unique years from visits, sorted chronologically
    const years = visits
      .map(visit => {
        const year = visit.split("-")[0];
        return parseInt(year, 10);
      })
      .filter(y => !isNaN(y));
    
    if (years.length === 0) return "n/a";
    
    // Get unique years and sort them
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    
    // Return comma-separated full years
    return uniqueYears.join(", ");
  };

  const displayValue = getDisplayValue();
  const isVisited = visits.length > 0 || isHomeCountry;

  return (
    <div className="relative">
      {/* Tooltip box */}
      <div className="flex items-center justify-center px-2.5 py-1.5 bg-gray-800 rounded-md shadow-lg whitespace-nowrap">
        <span className="text-xs text-white font-medium">
          {countryName}:{" "}
          <span className={isVisited ? "text-white" : "text-gray-400"}>
            {displayValue}
          </span>
        </span>
      </div>
      {/* Arrow pointing down */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "6px solid rgb(31, 41, 55)", // gray-800
        }}
      />
    </div>
  );
}
