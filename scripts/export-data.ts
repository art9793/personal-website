// Load environment variables from .env file BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";

const envPath = resolve(import.meta.dirname, "..", ".env");
config({ path: envPath });

// Now import db after .env is loaded
import { db } from "../server/db";
import { 
  profiles, 
  articles, 
  projects, 
  workExperiences, 
  readingList, 
  seoSettings,
  users 
} from "@shared/schema";
import fs from "fs";
import path from "path";

async function exportData() {
  console.log("📦 Exporting data from database...\n");

  try {
    // Export all tables
    const [profile] = await db.select().from(profiles);
    const allArticles = await db.select().from(articles);
    const allProjects = await db.select().from(projects);
    const allWorkExperiences = await db.select().from(workExperiences);
    const allReadingList = await db.select().from(readingList);
    const [seoSettingsData] = await db.select().from(seoSettings);
    const allUsers = await db.select().from(users);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: profile || null,
      articles: allArticles,
      projects: allProjects,
      workExperiences: allWorkExperiences,
      readingList: allReadingList,
      seoSettings: seoSettingsData || null,
      users: allUsers.map(user => ({
        // Don't export passwords for security - they'll need to be set up again
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.resolve(import.meta.dirname, "..", "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Save to file
    const exportFile = path.join(exportsDir, `data-export-${Date.now()}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

    console.log("✅ Data exported successfully!");
    console.log(`📄 Export file: ${exportFile}\n`);
    console.log("Summary:");
    console.log(`  - Profile: ${profile ? "✓" : "✗"}`);
    console.log(`  - Articles: ${allArticles.length}`);
    console.log(`  - Projects: ${allProjects.length}`);
    console.log(`  - Work Experiences: ${allWorkExperiences.length}`);
    console.log(`  - Reading List: ${allReadingList.length}`);
    console.log(`  - SEO Settings: ${seoSettingsData ? "✓" : "✗"}`);
    console.log(`  - Users: ${allUsers.length} (passwords not exported for security)\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    process.exit(1);
  }
}

exportData();

