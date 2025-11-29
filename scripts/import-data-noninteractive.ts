// Load environment variables from .env file BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";

const envPath = resolve(import.meta.dirname, "..", ".env");
config({ path: envPath });

import { db } from "../server/db";
import { 
  profiles, 
  articles, 
  projects, 
  workExperiences, 
  readingList, 
  seoSettings 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function importData() {
  try {
    // Find export files
    const exportsDir = path.resolve(import.meta.dirname, "..", "exports");
    
    if (!fs.existsSync(exportsDir)) {
      console.error("❌ Exports directory not found. Run export-data.ts first.");
      process.exit(1);
    }

    const files = fs.readdirSync(exportsDir)
      .filter(f => f.startsWith("data-export-") && f.endsWith(".json"))
      .sort()
      .reverse(); // Most recent first

    if (files.length === 0) {
      console.error("❌ No export files found. Run export-data.ts first.");
      process.exit(1);
    }

    // Use the most recent file, or allow override via environment variable
    const selectedFile = process.env.EXPORT_FILE || files[0];
    const filePath = path.join(exportsDir, selectedFile);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Export file not found: ${selectedFile}`);
      console.error(`   Available files: ${files.join(", ")}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log(`\n📥 Importing data from: ${selectedFile}`);
    console.log(`   Exported at: ${data.exportedAt}\n`);

    // Helper function to convert date strings to Date objects
    const convertDates = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      }
      if (typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key.includes('At') || key.includes('Date') || key === 'publishedAt' || key === 'startDate' || key === 'endDate') {
            converted[key] = value ? new Date(value as string) : value;
          } else if (typeof value === 'object' && value !== null) {
            converted[key] = convertDates(value);
          } else {
            converted[key] = value;
          }
        }
        return converted;
      }
      return obj;
    };

    // Import profile
    if (data.profile) {
      const profileData = convertDates(data.profile);
      const existing = await db.select().from(profiles).limit(1);
      if (existing.length > 0) {
        await db.update(profiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(profiles.id, existing[0].id));
        console.log("✓ Profile updated");
      } else {
        await db.insert(profiles).values(profileData);
        console.log("✓ Profile imported");
      }
    }

    // Import articles (clear and re-insert to avoid duplicates)
    if (data.articles && data.articles.length > 0) {
      const articlesData = convertDates(data.articles);
      await db.delete(articles);
      await db.insert(articles).values(articlesData);
      console.log(`✓ Imported ${data.articles.length} articles`);
    }

    // Import projects
    if (data.projects && data.projects.length > 0) {
      const projectsData = convertDates(data.projects);
      await db.delete(projects);
      await db.insert(projects).values(projectsData);
      console.log(`✓ Imported ${data.projects.length} projects`);
    }

    // Import work experiences
    if (data.workExperiences && data.workExperiences.length > 0) {
      const workData = convertDates(data.workExperiences);
      await db.delete(workExperiences);
      await db.insert(workExperiences).values(workData);
      console.log(`✓ Imported ${data.workExperiences.length} work experiences`);
    }

    // Import reading list
    if (data.readingList && data.readingList.length > 0) {
      const readingData = convertDates(data.readingList);
      await db.delete(readingList);
      await db.insert(readingList).values(readingData);
      console.log(`✓ Imported ${data.readingList.length} reading list items`);
    }

    // Import SEO settings
    if (data.seoSettings) {
      const seoData = convertDates(data.seoSettings);
      const existing = await db.select().from(seoSettings).limit(1);
      if (existing.length > 0) {
        await db.update(seoSettings)
          .set({ ...seoData, updatedAt: new Date() })
          .where(eq(seoSettings.id, existing[0].id));
        console.log("✓ SEO settings updated");
      } else {
        await db.insert(seoSettings).values(seoData);
        console.log("✓ SEO settings imported");
      }
    }

    console.log("\n✅ Data import completed successfully!");
    console.log("\n⚠️  Note: User accounts were not imported for security.");
    console.log("   Run the setup-admin script to create your admin account.\n");

  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

importData();

