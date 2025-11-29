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
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function importData() {
  const rl = readline.createInterface({ input, output });

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

    console.log("\n📦 Available export files:\n");
    files.forEach((file, index) => {
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${index + 1}. ${file} (${new Date(stats.mtime).toLocaleString()})`);
    });

    const choice = await rl.question("\nEnter the number of the file to import (or 'latest' for most recent): ");
    
    let selectedFile: string;
    if (choice.toLowerCase() === "latest" || choice === "1") {
      selectedFile = files[0];
    } else {
      const index = parseInt(choice) - 1;
      if (index < 0 || index >= files.length) {
        console.error("❌ Invalid selection");
        process.exit(1);
      }
      selectedFile = files[index];
    }

    const filePath = path.join(exportsDir, selectedFile);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log(`\n📥 Importing data from: ${selectedFile}`);
    console.log(`   Exported at: ${data.exportedAt}\n`);

    // Confirm import
    const confirm = await rl.question("⚠️  This will overwrite existing data. Continue? (yes/no): ");
    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Import cancelled");
      process.exit(0);
    }

    // Import profile
    if (data.profile) {
      const existing = await db.select().from(profiles).limit(1);
      if (existing.length > 0) {
        await db.update(profiles)
          .set({ ...data.profile, updatedAt: new Date() })
          .where(eq(profiles.id, existing[0].id));
        console.log("✓ Profile updated");
      } else {
        await db.insert(profiles).values(data.profile);
        console.log("✓ Profile imported");
      }
    }

    // Import articles (clear and re-insert to avoid duplicates)
    if (data.articles && data.articles.length > 0) {
      await db.delete(articles);
      await db.insert(articles).values(data.articles);
      console.log(`✓ Imported ${data.articles.length} articles`);
    }

    // Import projects
    if (data.projects && data.projects.length > 0) {
      await db.delete(projects);
      await db.insert(projects).values(data.projects);
      console.log(`✓ Imported ${data.projects.length} projects`);
    }

    // Import work experiences
    if (data.workExperiences && data.workExperiences.length > 0) {
      await db.delete(workExperiences);
      await db.insert(workExperiences).values(data.workExperiences);
      console.log(`✓ Imported ${data.workExperiences.length} work experiences`);
    }

    // Import reading list
    if (data.readingList && data.readingList.length > 0) {
      await db.delete(readingList);
      await db.insert(readingList).values(data.readingList);
      console.log(`✓ Imported ${data.readingList.length} reading list items`);
    }

    // Import SEO settings
    if (data.seoSettings) {
      const existing = await db.select().from(seoSettings).limit(1);
      if (existing.length > 0) {
        await db.update(seoSettings)
          .set({ ...data.seoSettings, updatedAt: new Date() })
          .where(eq(seoSettings.id, existing[0].id));
        console.log("✓ SEO settings updated");
      } else {
        await db.insert(seoSettings).values(data.seoSettings);
        console.log("✓ SEO settings imported");
      }
    }

    console.log("\n✅ Data import completed successfully!");
    console.log("\n⚠️  Note: User accounts were not imported for security.");
    console.log("   Run 'tsx scripts/setup-admin.ts' to create your admin account.\n");

  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

importData();

