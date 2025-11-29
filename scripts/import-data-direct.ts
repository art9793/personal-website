// Direct PostgreSQL import using node-postgres (not Neon serverless)
import pg from "pg";
const { Client } = pg;
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL must be set");
  process.exit(1);
}

async function importData() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Find export file
    const exportsDir = path.resolve(import.meta.dirname, "..", "exports");
    const files = fs.readdirSync(exportsDir)
      .filter(f => f.startsWith("data-export-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error("❌ No export files found");
      process.exit(1);
    }

    const selectedFile = process.env.EXPORT_FILE || files[0];
    const filePath = path.join(exportsDir, selectedFile);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log(`📥 Importing data from: ${selectedFile}`);
    console.log(`   Exported at: ${data.exportedAt}\n`);

    // Helper to convert date strings to Date objects
    const convertDates = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) return obj.map(convertDates);
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
      const profile = convertDates(data.profile);
      const existing = await client.query("SELECT id FROM profiles LIMIT 1");
      
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE profiles SET name = $1, title = $2, bio = $3, avatar_url = $4, 
           location = $5, website = $6, github = $7, linkedin = $8, twitter = $9, 
           updated_at = $10 WHERE id = $11`,
          [
            profile.name, profile.title, profile.bio, profile.avatarUrl,
            profile.location, profile.website, profile.github, profile.linkedin,
            profile.twitter, new Date(), existing.rows[0].id
          ]
        );
        console.log("✓ Profile updated");
      } else {
        await client.query(
          `INSERT INTO profiles (name, title, bio, avatar_url, location, website, github, linkedin, twitter, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            profile.name, profile.title, profile.bio, profile.avatarUrl,
            profile.location, profile.website, profile.github, profile.linkedin,
            profile.twitter, profile.createdAt || new Date(), profile.updatedAt || new Date()
          ]
        );
        console.log("✓ Profile imported");
      }
    }

    // Import articles
    if (data.articles && data.articles.length > 0) {
      await client.query("DELETE FROM articles");
      for (const article of convertDates(data.articles)) {
        await client.query(
          `INSERT INTO articles (title, slug, content, excerpt, author, status, views, published_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            article.title, 
            article.slug, 
            article.content, 
            article.excerpt,
            article.author || "Admin", // Default author if missing
            article.status || "Draft",
            article.views || "0",
            article.publishedAt, 
            article.createdAt || new Date(), 
            article.updatedAt || new Date()
          ]
        );
      }
      console.log(`✓ Imported ${data.articles.length} articles`);
    }

    // Import projects
    if (data.projects && data.projects.length > 0) {
      await client.query("DELETE FROM projects");
      for (const project of convertDates(data.projects)) {
        await client.query(
          `INSERT INTO projects (title, description, link, tags, status, featured, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            project.title, 
            project.description, 
            project.link || project.projectUrl || project.githubUrl,
            project.tags || JSON.stringify(project.technologies || []),
            project.status || "Active",
            project.featured || false,
            project.createdAt || new Date(), 
            project.updatedAt || new Date()
          ]
        );
      }
      console.log(`✓ Imported ${data.projects.length} projects`);
    }

    // Import work experiences
    if (data.workExperiences && data.workExperiences.length > 0) {
      await client.query("DELETE FROM work_experiences");
      for (const work of data.workExperiences) {
        await client.query(
          `INSERT INTO work_experiences (company, role, description, start_date, end_date, 
           logo, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            work.company, 
            work.role || work.position, 
            work.description, 
            work.startDate ? String(work.startDate) : "",
            work.endDate ? String(work.endDate) : (work.current ? "Present" : ""),
            work.logo || null,
            work.createdAt ? new Date(work.createdAt) : new Date(), 
            work.updatedAt ? new Date(work.updatedAt) : new Date()
          ]
        );
      }
      console.log(`✓ Imported ${data.workExperiences.length} work experiences`);
    }

    // Import reading list
    if (data.readingList && data.readingList.length > 0) {
      await client.query("DELETE FROM reading_list");
      for (const item of data.readingList) {
        await client.query(
          `INSERT INTO reading_list (title, author, link, status, rating, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            item.title, 
            item.author || "Unknown", 
            item.link || item.url, 
            item.status || "To Read", 
            item.rating || null, 
            item.notes || null,
            item.createdAt ? new Date(item.createdAt) : new Date(), 
            item.updatedAt ? new Date(item.updatedAt) : new Date()
          ]
        );
      }
      console.log(`✓ Imported ${data.readingList.length} reading list items`);
    }

    // Import SEO settings
    if (data.seoSettings) {
      const seo = data.seoSettings;
      const existing = await client.query("SELECT id FROM seo_settings LIMIT 1");
      
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE seo_settings SET site_title = $1, site_description = $2, site_keywords = $3, 
           og_image = $4, updated_at = $5 WHERE id = $6`,
          [
            seo.siteTitle || seo.title, 
            seo.siteDescription || seo.description, 
            seo.siteKeywords || seo.keywords, 
            seo.ogImage,
            new Date(), 
            existing.rows[0].id
          ]
        );
        console.log("✓ SEO settings updated");
      } else {
        await client.query(
          `INSERT INTO seo_settings (site_title, site_description, site_keywords, og_image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            seo.siteTitle || seo.title || "Portfolio",
            seo.siteDescription || seo.description || "Welcome to my portfolio",
            seo.siteKeywords || seo.keywords,
            seo.ogImage,
            seo.createdAt ? new Date(seo.createdAt) : new Date(), 
            seo.updatedAt ? new Date(seo.updatedAt) : new Date()
          ]
        );
        console.log("✓ SEO settings imported");
      }
    }

    console.log("\n✅ Data import completed successfully!");

  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

importData();

