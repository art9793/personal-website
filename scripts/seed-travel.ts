// Run with: npx tsx --env-file=.env scripts/seed-travel.ts
import { db } from "../server/db";
import { travelHistory } from "../shared/schema";

// Your actual travel history data
const travelData = [
  // Home country
  { countryCode: "IN", countryName: "India", visitDate: null, notes: null, isHomeCountry: true },
  
  // Thailand - 2 visits
  { countryCode: "TH", countryName: "Thailand", visitDate: "2019-03", notes: null, isHomeCountry: false },
  { countryCode: "TH", countryName: "Thailand", visitDate: "2024-09", notes: null, isHomeCountry: false },
  
  // Indonesia
  { countryCode: "ID", countryName: "Indonesia", visitDate: "2022-08", notes: null, isHomeCountry: false },
  
  // Saudi Arabia
  { countryCode: "SA", countryName: "Saudi Arabia", visitDate: "2023-01", notes: null, isHomeCountry: false },
  
  // Spain
  { countryCode: "ES", countryName: "Spain", visitDate: "2024-07", notes: null, isHomeCountry: false },
  
  // Portugal
  { countryCode: "PT", countryName: "Portugal", visitDate: "2024-07", notes: null, isHomeCountry: false },
  
  // Vietnam
  { countryCode: "VN", countryName: "Vietnam", visitDate: "2024-09", notes: null, isHomeCountry: false },
  
  // Japan
  { countryCode: "JP", countryName: "Japan", visitDate: "2025-04", notes: null, isHomeCountry: false },
  
  // Germany
  { countryCode: "DE", countryName: "Germany", visitDate: "2025-08", notes: null, isHomeCountry: false },
  
  // Netherlands
  { countryCode: "NL", countryName: "Netherlands", visitDate: "2025-08", notes: null, isHomeCountry: false },
  
  // Malaysia
  { countryCode: "MY", countryName: "Malaysia", visitDate: "2025-12", notes: null, isHomeCountry: false },
  
  // Australia
  { countryCode: "AU", countryName: "Australia", visitDate: "2025-12", notes: null, isHomeCountry: false },
];

async function seedTravelHistory() {
  console.log("Seeding travel history...");
  
  // Check if data already exists
  const existing = await db.select().from(travelHistory);
  if (existing.length > 0) {
    console.log(`Travel history already has ${existing.length} entries. Skipping seed.`);
    console.log("To re-seed, manually delete existing entries first.");
    process.exit(0);
  }
  
  // Insert all travel data
  for (const entry of travelData) {
    await db.insert(travelHistory).values(entry);
    console.log(`  Added: ${entry.countryName}${entry.visitDate ? ` (${entry.visitDate})` : ' (home)'}`);
  }
  
  console.log(`\nSuccessfully seeded ${travelData.length} travel history entries!`);
  process.exit(0);
}

seedTravelHistory().catch((error) => {
  console.error("Error seeding travel history:", error);
  process.exit(1);
});
