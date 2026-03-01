import dynamic from "next/dynamic";
import { AlertCircle } from "lucide-react";
import { getTravelData } from "../../_lib/public-data";
import { PageHeader } from "@/components/page-header";

const WorldMap = dynamic(
  () => import("@/components/travel/WorldMap").then((m) => ({ default: m.WorldMap })),
  {
    loading: () => (
      <div className="w-full h-[480px] bg-muted animate-pulse rounded-lg" />
    ),
  },
);

export const revalidate = 3600;

export const metadata = {
  title: "Travel",
};

export default async function Page() {
  const { groupedTravelData, stats } = await getTravelData();

  if (groupedTravelData.length === 0) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Travel" subtitle="A visual journey through the countries I've visited." />
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
      <PageHeader title="Travel" subtitle="A visual journey through the countries I've visited." />
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
