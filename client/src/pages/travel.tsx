import { useMemo } from "react";
import { WorldMap } from "@/components/travel/WorldMap";
import { useTravelHistory } from "@/lib/content-hooks";
import { Loader2, AlertCircle } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

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
  useDocumentTitle("Travel");
  const { travelHistory, isLoading } = useTravelHistory();

  // Transform API data (individual entries) to grouped format for WorldMap
  const groupedTravelData = useMemo(() => {
    const grouped = travelHistory.reduce((acc, entry) => {
      // Normalize country code to uppercase to ensure uniqueness
      const code = entry.countryCode?.toUpperCase()?.trim() || '';
      if (!code) return acc; // Skip entries without country code

      if (!acc[code]) {
        acc[code] = {
          countryCode: code,
          countryName: entry.countryName,
          visits: [],
          isHomeCountry: entry.isHomeCountry || false,
        };
      } else {
        // If country already exists, preserve isHomeCountry flag if it's true
        if (entry.isHomeCountry) {
          acc[code].isHomeCountry = true;
        }
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
    // Count only visited countries (exclude home country from count)
    // Use Set to ensure we're counting unique country codes
    const countriesToCount = groupedTravelData.filter(v => v.visits.length > 0 && !v.isHomeCountry);

    const uniqueCountryCodes = new Set(
      countriesToCount.map(v => v.countryCode.toUpperCase())
    );
    const totalCountries = uniqueCountryCodes.size;

    // For continents, include all countries (including home country)
    const allCountriesForContinents = groupedTravelData.filter(v => v.visits.length > 0 || v.isHomeCountry);
    const continentsVisited = new Set(
      allCountriesForContinents
        .map(v => continentMap[v.countryCode.toUpperCase()])
        .filter(Boolean)
    ).size;

    const worldPercentage = Math.round((totalCountries / 195) * 100);

    return { totalCountries, continentsVisited, worldPercentage };
  }, [groupedTravelData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.40))]">
        <div className="space-y-2 flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-lg">
            A visual journey through the countries I've visited.
          </p>
        </div>
        <div className="flex-1 min-h-0 mt-6 flex items-center justify-center border border-border rounded-lg bg-muted/20">
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
      <div className="flex flex-col h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.40))]">
        <div className="space-y-2 flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-lg">
            A visual journey through the countries I've visited.
          </p>
        </div>
        <div className="flex-1 min-h-0 mt-6 flex items-center justify-center border border-border rounded-lg bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span>No travel history yet. Check back soon!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.40))]">
      <div className="space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
        <p className="text-muted-foreground text-lg">
          A visual journey through the countries I've visited.
        </p>
      </div>

      {/* World Map */}
      <div className="flex-1 min-h-0 mt-6 flex flex-col">
        <WorldMap travelHistory={groupedTravelData} />
        <p className="text-sm text-muted-foreground mt-4 flex-shrink-0">
          {stats.totalCountries} countries · {stats.continentsVisited} continents · {stats.worldPercentage}% of the world
        </p>
      </div>
    </div>
  );
}
