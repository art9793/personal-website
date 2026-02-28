import { AlertCircle } from "lucide-react";
import { WorldMap } from "@/components/travel/WorldMap";
import { getTravelData } from "../../_lib/public-data";

export const metadata = {
  title: "Travel",
};

export default async function Page() {
  const { groupedTravelData, stats } = await getTravelData();

  if (groupedTravelData.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-lg">A visual journey through the countries I&apos;ve visited.</p>
        </div>
        <div className="mt-6 flex items-center justify-center border border-border rounded-lg bg-muted/20 py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span>No travel history yet. Check back soon!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Travel</h1>
        <p className="text-muted-foreground text-lg">A visual journey through the countries I&apos;ve visited.</p>
      </div>
      <div className="mt-6">
        <WorldMap travelHistory={groupedTravelData} />
        <p className="text-sm text-muted-foreground mt-4 flex-shrink-0">
          {stats.totalCountries} countries · {stats.continentsVisited} continents · {stats.worldPercentage}% of the
          world
        </p>
      </div>
    </div>
  );
}
