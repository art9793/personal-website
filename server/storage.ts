import {
  users,
  profiles,
  articles,
  projects,
  workExperiences,
  readingList,
  seoSettings,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Article,
  type InsertArticle,
  type Project,
  type InsertProject,
  type WorkExperience,
  type InsertWorkExperience,
  type ReadingListItem,
  type InsertReadingList,
  type SeoSettings,
  type InsertSeoSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Profile operations
  getProfile(): Promise<Profile | undefined>;
  updateProfile(data: Partial<InsertProfile>): Promise<Profile>;

  // SEO Settings operations
  getSeoSettings(): Promise<SeoSettings | undefined>;
  updateSeoSettings(data: Partial<InsertSeoSettings>): Promise<SeoSettings>;

  // Article operations
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(data: InsertArticle): Promise<Article>;
  updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Work Experience operations
  getWorkExperiences(): Promise<WorkExperience[]>;
  getWorkExperience(id: number): Promise<WorkExperience | undefined>;
  createWorkExperience(data: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: number, data: Partial<InsertWorkExperience>): Promise<WorkExperience>;
  deleteWorkExperience(id: number): Promise<void>;

  // Reading List operations
  getReadingList(): Promise<ReadingListItem[]>;
  getReadingListItem(id: number): Promise<ReadingListItem | undefined>;
  createReadingListItem(data: InsertReadingList): Promise<ReadingListItem>;
  updateReadingListItem(id: number, data: Partial<InsertReadingList>): Promise<ReadingListItem>;
  deleteReadingListItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).limit(1);
    return profile;
  }

  async updateProfile(data: Partial<InsertProfile>): Promise<Profile> {
    const existingProfile = await this.getProfile();
    
    if (existingProfile) {
      const [updated] = await db
        .update(profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profiles.id, existingProfile.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(profiles)
        .values(data as InsertProfile)
        .returning();
      return created;
    }
  }

  // SEO Settings operations
  async getSeoSettings(): Promise<SeoSettings | undefined> {
    const [settings] = await db.select().from(seoSettings).limit(1);
    return settings;
  }

  async updateSeoSettings(data: Partial<InsertSeoSettings>): Promise<SeoSettings> {
    const existingSettings = await this.getSeoSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(seoSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(seoSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(seoSettings)
        .values(data as InsertSeoSettings)
        .returning();
      return created;
    }
  }

  // Article operations
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async createArticle(data: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(data).returning();
    return article;
  }

  async updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article> {
    const [updated] = await db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Work Experience operations
  async getWorkExperiences(): Promise<WorkExperience[]> {
    return await db.select().from(workExperiences).orderBy(desc(workExperiences.startDate));
  }

  async getWorkExperience(id: number): Promise<WorkExperience | undefined> {
    const [work] = await db.select().from(workExperiences).where(eq(workExperiences.id, id));
    return work;
  }

  async createWorkExperience(data: InsertWorkExperience): Promise<WorkExperience> {
    const [work] = await db.insert(workExperiences).values(data).returning();
    return work;
  }

  async updateWorkExperience(id: number, data: Partial<InsertWorkExperience>): Promise<WorkExperience> {
    const [updated] = await db
      .update(workExperiences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workExperiences.id, id))
      .returning();
    return updated;
  }

  async deleteWorkExperience(id: number): Promise<void> {
    await db.delete(workExperiences).where(eq(workExperiences.id, id));
  }

  // Reading List operations
  async getReadingList(): Promise<ReadingListItem[]> {
    return await db.select().from(readingList).orderBy(desc(readingList.createdAt));
  }

  async getReadingListItem(id: number): Promise<ReadingListItem | undefined> {
    const [item] = await db.select().from(readingList).where(eq(readingList.id, id));
    return item;
  }

  async createReadingListItem(data: InsertReadingList): Promise<ReadingListItem> {
    const [item] = await db.insert(readingList).values(data).returning();
    return item;
  }

  async updateReadingListItem(id: number, data: Partial<InsertReadingList>): Promise<ReadingListItem> {
    const [updated] = await db
      .update(readingList)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(readingList.id, id))
      .returning();
    return updated;
  }

  async deleteReadingListItem(id: number): Promise<void> {
    await db.delete(readingList).where(eq(readingList.id, id));
  }
}

export const storage = new DatabaseStorage();
