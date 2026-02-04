import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Profile table for website owner information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  location: varchar("location", { length: 255 }),
  email: varchar("email", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  github: varchar("github", { length: 255 }),
  website: varchar("website", { length: 255 }),
  avatarUrl: text("avatar_url"),
  showTwitter: boolean("show_twitter").default(true),
  showLinkedin: boolean("show_linkedin").default(true),
  showGithub: boolean("show_github").default(true),
  showEmail: boolean("show_email").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// SEO Settings table for website-wide metadata
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  siteTitle: varchar("site_title", { length: 255 }).notNull().default("Portfolio"),
  siteDescription: text("site_description").notNull().default("Welcome to my portfolio"),
  siteKeywords: text("site_keywords"),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterCard: varchar("twitter_card", { length: 50 }).default("summary_large_image"),
  twitterSite: varchar("twitter_site", { length: 255 }),
  twitterCreator: varchar("twitter_creator", { length: 255 }),
  faviconUrl: text("favicon_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  tags: text("tags"),
  seoKeywords: text("seo_keywords"),
  author: varchar("author", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Draft"),
  views: varchar("views", { length: 50 }).notNull().default("0"),
  publishedAt: timestamp("published_at"),
  firstPublishedAt: timestamp("first_published_at"),
  lastPublishedAt: timestamp("last_published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_articles_slug").on(table.slug),
  index("idx_articles_status").on(table.status),
  index("idx_articles_created_at").on(table.createdAt),
]);

export const insertArticleSchema = createInsertSchema(articles, {
  slug: z.string().nullable().optional(),
  publishedAt: z.union([z.date(), z.string().datetime().transform(val => new Date(val)), z.string().transform(val => new Date(val))]).nullable().optional(),
  firstPublishedAt: z.union([z.date(), z.string().datetime().transform(val => new Date(val)), z.string().transform(val => new Date(val))]).nullable().optional(),
  lastPublishedAt: z.union([z.date(), z.string().datetime().transform(val => new Date(val)), z.string().transform(val => new Date(val))]).nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  link: varchar("link", { length: 500 }),
  tags: text("tags"),
  status: varchar("status", { length: 50 }).notNull().default("Active"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_projects_status").on(table.status),
]);

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Work Experience table
export const workExperiences = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  startDate: varchar("start_date", { length: 50 }).notNull(),
  endDate: varchar("end_date", { length: 50 }).notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkExperienceSchema = createInsertSchema(workExperiences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type WorkExperience = typeof workExperiences.$inferSelect;

// Reading List table
export const readingList = pgTable("reading_list", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  link: varchar("link", { length: 500 }),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("To Read"),
  rating: varchar("rating", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReadingListSchema = createInsertSchema(readingList).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReadingList = z.infer<typeof insertReadingListSchema>;
export type ReadingListItem = typeof readingList.$inferSelect;

// Travel History table
export const travelHistory = pgTable("travel_history", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  countryName: varchar("country_name", { length: 255 }).notNull(),
  visitDate: varchar("visit_date", { length: 7 }), // "YYYY-MM" format, null for home country
  notes: text("notes"),
  isHomeCountry: boolean("is_home_country").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTravelHistorySchema = createInsertSchema(travelHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTravelHistory = z.infer<typeof insertTravelHistorySchema>;
export type TravelHistoryEntry = typeof travelHistory.$inferSelect;
