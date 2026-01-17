import { useMemo } from "react";
import { WorldMap } from "@/components/travel/WorldMap";
import { useTravelHistory } from "@/lib/content-hooks";
import { Loader2, AlertCircle } from "lucide-react";

// Continent mapping for country codes
const continentMap: Record<string, string> = {
  // Asia
  IN: 'Asia', TH: 'Asia', ID: 'Asia', SA: 'Asia', VN: 'Asia',
  JP: 'Asia', MY: 'Asia', CN: 'Asia', KR: 'Asia', SG: 'Asia',
  PH: 'Asia', AE: 'Asia', QA: 'Asia', KW: 'Asia', BH: 'Asia',
  OM: 'Asia', LK: 'Asia', NP: 'Asia', BD: 'Asia', PK: 'Asia',
  // Europe
  ES: 'Europe', PT: 'Europe', DE: 'Europe', NL: 'Europe',
  FR: 'Europe', IT: 'Europe', GB: 'Europe', CH: 'Europe',
  AT: 'Europe', BE: 'Europe', SE: 'Europe', NO: 'Europe',
  DK: 'Europe', FI: 'Europe', IE: 'Europe', PL: 'Europe',
  CZ: 'Europe', GR: 'Europe', HU: 'Europe', RO: 'Europe',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania',
  // Americas
  US: 'Americas', CA: 'Americas', MX: 'Americas', BR: 'Americas',
  AR: 'Americas', CL: 'Americas', CO: 'Americas', PE: 'Americas',
  // Africa
  ZA: 'Africa', EG: 'Africa', MA: 'Africa', KE: 'Africa',
  NG: 'Africa', GH: 'Africa', TZ: 'Africa', ET: 'Africa',
};

export default function Travel() {
  const { travelHistory, isLoading } = useTravelHistory();

  // Transform API data (individual entries) to grouped format for WorldMap
  const groupedTravelData = useMemo(() => {
    const grouped = travelHistory.reduce((acc, entry) => {
      const code = entry.countryCode;
      if (!acc[code]) {
        acc[code] = {
          countryCode: code,
          countryName: entry.countryName,
          visits: [],
          isHomeCountry: entry.isHomeCountry || false,
        };
      }
      // Add visit date if it exists (home country has null visitDate)
      if (entry.visitDate) {
        acc[code].visits.push(entry.visitDate);
      }
      return acc;
    }, {} as Record<string, { countryCode: string; countryName: string; visits: string[]; isHomeCountry: boolean }>);

    // Sort visits chronologically for each country
    Object.values(grouped).forEach(country => {
      country.visits.sort();
    });

    return Object.values(grouped);
  }, [travelHistory]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const visitedCountries = groupedTravelData.filter(v => v.visits.length > 0);
    const totalCountries = visitedCountries.length;
    
    const continentsVisited = new Set(
      visitedCountries.map(v => continentMap[v.countryCode]).filter(Boolean)
    ).size;
    
    const worldPercentage = Math.round((totalCountries / 195) * 100);

    return { totalCountries, continentsVisited, worldPercentage };
  }, [groupedTravelData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-lg">
            A visual journey through the countries I've visited.
          </p>
        </div>
        <div className="flex items-center justify-center h-[500px] md:h-[600px] border border-border rounded-lg bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading travel history...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (groupedTravelData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-lg">
            A visual journey through the countries I've visited.
          </p>
        </div>
        <div className="flex items-center justify-center h-[500px] md:h-[600px] border border-border rounded-lg bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span>No travel history yet. Check back soon!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
        <p className="text-muted-foreground text-lg">
          A visual journey through the countries I've visited.
        </p>
      </div>

      {/* World Map */}
      <div className="space-y-4">
        <WorldMap travelHistory={groupedTravelData} />
        <p className="text-sm text-muted-foreground">
          {stats.totalCountries} countries · {stats.continentsVisited} continents · {stats.worldPercentage}% of the world
        </p>
      </div>
    </div>
  );
}
