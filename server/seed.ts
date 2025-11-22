import { db } from "./db";
import { profiles, articles, projects, workExperiences, readingList } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed profile
  try {
    const existingProfile = await db.select().from(profiles).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(profiles).values({
        name: "Arshad Teli",
        title: "Product Manager",
        bio: "Hey there! I'm a Product Manager & Designer currently working at a UK based fintech!",
        location: "United Kingdom",
        email: "art9793@gmail.com",
        twitter: "https://x.com/art9793",
        github: "https://github.com/art9793",
        linkedin: "",
        website: "",
      });
      console.log("✓ Profile seeded");
    } else {
      console.log("✓ Profile already exists");
    }
  } catch (error) {
    console.error("Error seeding profile:", error);
  }

  // Seed sample articles
  try {
    const existingArticles = await db.select().from(articles).limit(1);
    if (existingArticles.length === 0) {
      await db.insert(articles).values([
        {
          title: "Designing for AI",
          slug: "designing-for-ai",
          content: "<h2>Introduction</h2><p>Start writing...</p>",
          excerpt: "Exploring the challenges and opportunities...",
          tags: "Design, AI",
          seoKeywords: "ai, design, ux",
          author: "Arshad Teli",
          status: "Published",
          views: "2400",
          publishedAt: new Date("2024-10-24"),
        },
        {
          title: "The craft of software",
          slug: "craft-of-software",
          content: "<h2>Introduction</h2><p>Start writing...</p>",
          excerpt: "Why details matter in software...",
          tags: "Engineering, Craft",
          seoKeywords: "software, craft, engineering",
          author: "Arshad Teli",
          status: "Published",
          views: "1800",
          publishedAt: new Date("2024-08-12"),
        },
        {
          title: "Building Campsite",
          slug: "building-campsite",
          content: "<h2>Introduction</h2><p>Start writing...</p>",
          excerpt: "A journey of building a new product...",
          tags: "Product, Startup",
          seoKeywords: "startup, product, campsite",
          author: "Arshad Teli",
          status: "Published",
          views: "3200",
          publishedAt: new Date("2024-05-03"),
        },
      ]);
      console.log("✓ Sample articles seeded");
    } else {
      console.log("✓ Articles already exist");
    }
  } catch (error) {
    console.error("Error seeding articles:", error);
  }

  // Seed sample projects
  try {
    const existingProjects = await db.select().from(projects).limit(1);
    if (existingProjects.length === 0) {
      await db.insert(projects).values([
        {
          title: "Personal Portfolio",
          description: "A minimalist personal website built with modern web technologies",
          link: "",
          tags: "React, Node.js, Design",
          status: "Active",
          featured: true,
        },
        {
          title: "Product Analytics Dashboard",
          description: "Real-time analytics dashboard for product metrics",
          link: "",
          tags: "Analytics, Data, UI/UX",
          status: "Active",
          featured: false,
        },
      ]);
      console.log("✓ Sample projects seeded");
    } else {
      console.log("✓ Projects already exist");
    }
  } catch (error) {
    console.error("Error seeding projects:", error);
  }

  // Seed sample work experience
  try {
    const existingWork = await db.select().from(workExperiences).limit(1);
    if (existingWork.length === 0) {
      await db.insert(workExperiences).values([
        {
          company: "UK Fintech Company",
          role: "Product Manager",
          startDate: "2022-05-01",
          endDate: "Present",
          description: "Leading the core product team to build the future of finance.",
        },
        {
          company: "TechStart",
          role: "Product Designer",
          startDate: "2020-03-01",
          endDate: "2022-04-30",
          description: "Designed the initial MVP and scaled the design system.",
        },
      ]);
      console.log("✓ Sample work experiences seeded");
    } else {
      console.log("✓ Work experiences already exist");
    }
  } catch (error) {
    console.error("Error seeding work experiences:", error);
  }

  console.log("Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
