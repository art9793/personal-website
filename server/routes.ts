import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import passport from "passport";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission, setObjectAclPolicy } from "./objectAcl";
import { logError } from "./app";
import {
  insertProfileSchema,
  insertArticleSchema,
  insertProjectSchema,
  insertWorkExperienceSchema,
  insertReadingListSchema,
  insertSeoSettingsSchema,
  insertTravelHistorySchema,
  type User,
} from "@shared/schema";

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for view tracking (prevent inflation)
const viewLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 view tracks per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (more lenient)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF protection middleware
function csrfProtection(req: any, res: any, next: any) {
  // Skip CSRF for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // For development, be lenient
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Build set of trusted hostnames:
  // - req.hostname respects trust proxy / X-Forwarded-Host (handles Cloudflare/Railway)
  // - req.headers.host is the raw Host header
  // - DEPLOYMENT_URL is an explicit allow-list entry
  const trustedHosts = new Set<string>();
  if (req.hostname) trustedHosts.add(req.hostname);
  if (req.headers.host) trustedHosts.add(req.headers.host.split(':')[0]);
  if (process.env.DEPLOYMENT_URL) {
    try { trustedHosts.add(new URL(process.env.DEPLOYMENT_URL).hostname); } catch {}
  }

  // Check Origin header against trusted hosts
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (trustedHosts.has(originHost)) {
        return next();
      }
    } catch {
      // Invalid origin URL
    }
  }

  // Check Referer header against trusted hosts
  if (referer) {
    try {
      const refererHost = new URL(referer).hostname;
      if (trustedHosts.has(refererHost)) {
        return next();
      }
    } catch {
      // Invalid referer URL
    }
  }

  // Reject in production if no header matched
  if (process.env.NODE_ENV === 'production') {
    console.warn(`CSRF blocked: ${req.method} ${req.path} | origin=${origin} hostname=${req.hostname} host=${req.headers.host}`);
    return res.status(403).json({ message: "CSRF validation failed" });
  }

  // Default: allow in non-production environments
  next();
}

// Parse and validate a numeric ID from route params. Returns null if invalid.
function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
}

// Helper function to get deployment URL
function getDeploymentUrl(): string {
  // Check for explicit deployment URL first
  if (process.env.DEPLOYMENT_URL) {
    return process.env.DEPLOYMENT_URL;
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Railway
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // Render
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // Fallback to request host in development
  return 'https://arshad-teli.com';
}

// Helper function to format date for sitemap (YYYY-MM-DD)
function formatSitemapDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Sitemap cache with TTL (10 minutes)
interface SitemapCache {
  content: string;
  expiresAt: number;
}

let sitemapCache: SitemapCache | null = null;
let sitemapGenerating: Promise<string> | null = null;
const SITEMAP_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Function to invalidate sitemap cache (call when articles/projects are updated)
export function invalidateSitemapCache() {
  sitemapCache = null;
}

// Function to generate sitemap XML
async function generateSitemap(): Promise<string> {
  const baseUrl = getDeploymentUrl();

  // Fetch data with individual error handling — degrade gracefully
  let publishedArticles: Awaited<ReturnType<typeof storage.getPublishedArticles>> = [];
  let activeProjects: Awaited<ReturnType<typeof storage.getActiveProjects>> = [];
  let profile: Awaited<ReturnType<typeof storage.getProfile>> = undefined;

  try {
    publishedArticles = (await storage.getPublishedArticles())
      .filter(a => a.slug)
      .sort((a, b) => {
        const dateA = a.updatedAt || a.publishedAt || a.createdAt;
        const dateB = b.updatedAt || b.publishedAt || b.createdAt;
        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;
        return timeB - timeA;
      });
  } catch (err) {
    console.error("Sitemap: failed to fetch articles:", err);
  }

  try {
    activeProjects = (await storage.getActiveProjects())
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
  } catch (err) {
    console.error("Sitemap: failed to fetch projects:", err);
  }

  try {
    profile = await storage.getProfile();
  } catch (err) {
    console.error("Sitemap: failed to fetch profile:", err);
  }
  const profileLastmod = profile?.updatedAt ? formatSitemapDate(profile.updatedAt) : formatSitemapDate(new Date());

  // Get most recent article date for /writing page
  const mostRecentArticleDate = publishedArticles.length > 0 
    ? formatSitemapDate(publishedArticles[0].updatedAt || publishedArticles[0].publishedAt || publishedArticles[0].createdAt)
    : profileLastmod;

  // Get most recent project date for /projects page
  const mostRecentProjectDate = activeProjects.length > 0
    ? formatSitemapDate(activeProjects[0].updatedAt || activeProjects[0].createdAt)
    : profileLastmod;

  // Build sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${profileLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/writing</loc>
    <lastmod>${mostRecentArticleDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${mostRecentProjectDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/work</loc>
    <lastmod>${profileLastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/reading</loc>
    <lastmod>${profileLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/travel</loc>
    <lastmod>${profileLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

  // Add published articles
  for (const article of publishedArticles) {
    const lastmod = formatSitemapDate(article.updatedAt || article.publishedAt || article.createdAt);
    const slug = article.slug || article.id.toString();
    sitemap += `  <url>
    <loc>${baseUrl}/article/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;
  return sitemap;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Apply CSRF protection to all routes
  app.use(csrfProtection);

  // Apply general API rate limiting
  app.use('/api', apiLimiter);

  // Dynamic robots.txt generation
  app.get('/robots.txt', async (req, res) => {
    try {
      const baseUrl = getDeploymentUrl();
      const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
      res.set('Content-Type', 'text/plain');
      res.send(robots);
    } catch (error) {
      logError("Error generating robots.txt", error, "robots");
      res.status(500).send('User-agent: *\nDisallow: /');
    }
  });

  // Dynamic sitemap generation with caching (before API routes to avoid rate limiting)
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const now = Date.now();
      
      // Check if cache is valid
      if (sitemapCache && sitemapCache.expiresAt > now) {
        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=600'); // 10 minutes
        res.set('X-Cache', 'HIT');
        return res.send(sitemapCache.content);
      }
      
      // Deduplicate concurrent generation requests
      if (!sitemapGenerating) {
        sitemapGenerating = generateSitemap().finally(() => {
          sitemapGenerating = null;
        });
      }
      const sitemap = await sitemapGenerating;

      // Cache the result
      sitemapCache = {
        content: sitemap,
        expiresAt: now + SITEMAP_CACHE_TTL,
      };
      
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes
      res.set('X-Cache', 'MISS');
      res.send(sitemap);
    } catch (error) {
      logError("Error generating sitemap", error, "sitemap");
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
    }
  });

  // Auth routes with stricter rate limiting
  app.post('/api/auth/login', authLimiter, (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in" });
        }
        return res.json({ 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      });
    } catch (error) {
      logError("Error fetching user", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object Storage routes (Reference: blueprint:javascript_object_storage)
  // Endpoint for getting upload URL (admin only)
  app.post('/api/objects/upload', isAdmin, async (req, res) => {
    try {
      const contentType = req.body?.contentType as string | undefined;
      const objectStorageService = new ObjectStorageService();
      const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL, objectPath });
    } catch (error: any) {
      if (error?.message?.includes('File type not allowed')) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Endpoint for setting ACL policy after image upload (admin only)
  app.put('/api/article-images', isAdmin, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public", // Article images are publicly accessible
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting article image ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint for serving uploaded objects (public read for objects with public ACL)
  app.get('/objects/:objectPath(*)', async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      
      // Check ACL using canAccessObjectEntity which handles both public and private objects
      // For public objects with READ permission, it returns true even without userId
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Profile routes
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await storage.getProfile();
      // Cache profile for 5 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAdmin, async (req, res) => {
    try {
      const validated = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(validated);
      invalidateSitemapCache(); // Invalidate cache when profile is updated (affects lastmod)
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.put('/api/profile/avatar', isAdmin, async (req: any, res) => {
    try {
      if (!req.body.objectPath) {
        return res.status(400).json({ error: "objectPath is required" });
      }

      const objectPath = req.body.objectPath;
      
      if (!objectPath.startsWith('/objects/')) {
        return res.status(400).json({ error: "Invalid object path format" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Get the object file and verify it exists
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Set ACL policy to make it publicly readable
      const userId = req.user?.id || "admin";
      await setObjectAclPolicy(objectFile, {
        owner: userId,
        visibility: "public",
      });

      // Update profile with the object path
      const profile = await storage.updateProfile({ avatarUrl: objectPath });
      res.json({ avatarUrl: profile.avatarUrl });
    } catch (error) {
      console.error("Error setting avatar:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Uploaded file not found" });
      }
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  app.delete('/api/profile/avatar', isAdmin, async (req, res) => {
    try {
      const profile = await storage.updateProfile({ avatarUrl: null });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      res.status(500).json({ error: "Failed to delete avatar" });
    }
  });

  // SEO Settings routes
  app.get('/api/seo-settings', async (req, res) => {
    try {
      const settings = await storage.getSeoSettings();
      // Cache SEO settings for 10 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1200');
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.put('/api/seo-settings', isAdmin, async (req, res) => {
    try {
      const validated = insertSeoSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSeoSettings(validated);
      res.json(settings);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(400).json({ message: "Failed to update SEO settings" });
    }
  });

  // Article routes
  app.get('/api/articles', async (req, res) => {
    try {
      const articles = await storage.getArticles();
      // Cache articles list for 2 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get('/api/articles/slug/:slug', async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      // Only serve non-published articles to admin users
      if (article.status !== "Published") {
        const user = req.user as User | undefined;
        const allowedEmail = process.env.ADMIN_EMAIL;
        if (!allowedEmail || !req.isAuthenticated() || !user || user.email !== allowedEmail) {
          return res.status(404).json({ message: "Article not found" });
        }
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post('/api/articles', isAdmin, async (req, res) => {
    try {
      // Allow partial data for draft creation (slug can be undefined/null)
      const validated = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validated);
      invalidateSitemapCache(); // Invalidate cache when article is created
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(400).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/articles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const validated = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, validated);
      invalidateSitemapCache(); // Invalidate cache when article is updated
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(400).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/articles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteArticle(id);
      invalidateSitemapCache(); // Invalidate cache when article is deleted
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      // Cache projects list for 5 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAdmin, async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validated);
      invalidateSitemapCache(); // Invalidate cache when project is created
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const validated = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validated);
      invalidateSitemapCache(); // Invalidate cache when project is updated
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteProject(id);
      invalidateSitemapCache(); // Invalidate cache when project is deleted
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Work Experience routes
  app.get('/api/work-experiences', async (req, res) => {
    try {
      const workExperiences = await storage.getWorkExperiences();
      // Cache work experiences for 10 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1200');
      res.json(workExperiences);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      res.status(500).json({ message: "Failed to fetch work experiences" });
    }
  });

  app.get('/api/work-experiences/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const work = await storage.getWorkExperience(id);
      if (!work) {
        return res.status(404).json({ message: "Work experience not found" });
      }
      res.json(work);
    } catch (error) {
      console.error("Error fetching work experience:", error);
      res.status(500).json({ message: "Failed to fetch work experience" });
    }
  });

  app.post('/api/work-experiences', isAdmin, async (req, res) => {
    try {
      const validated = insertWorkExperienceSchema.parse(req.body);
      const work = await storage.createWorkExperience(validated);
      res.status(201).json(work);
    } catch (error) {
      console.error("Error creating work experience:", error);
      res.status(400).json({ message: "Failed to create work experience" });
    }
  });

  app.put('/api/work-experiences/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const validated = insertWorkExperienceSchema.partial().parse(req.body);
      const work = await storage.updateWorkExperience(id, validated);
      res.json(work);
    } catch (error) {
      console.error("Error updating work experience:", error);
      res.status(400).json({ message: "Failed to update work experience" });
    }
  });

  app.delete('/api/work-experiences/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteWorkExperience(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work experience:", error);
      res.status(500).json({ message: "Failed to delete work experience" });
    }
  });

  // Reading List routes
  app.get('/api/reading-list', async (req, res) => {
    try {
      const items = await storage.getReadingList();
      // Cache reading list for 5 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.json(items);
    } catch (error) {
      console.error("Error fetching reading list:", error);
      res.status(500).json({ message: "Failed to fetch reading list" });
    }
  });

  app.get('/api/reading-list/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const item = await storage.getReadingListItem(id);
      if (!item) {
        return res.status(404).json({ message: "Reading list item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching reading list item:", error);
      res.status(500).json({ message: "Failed to fetch reading list item" });
    }
  });

  app.post('/api/reading-list', isAdmin, async (req, res) => {
    try {
      const validated = insertReadingListSchema.parse(req.body);
      const item = await storage.createReadingListItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating reading list item:", error);
      res.status(400).json({ message: "Failed to create reading list item" });
    }
  });

  app.put('/api/reading-list/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const validated = insertReadingListSchema.partial().parse(req.body);
      const item = await storage.updateReadingListItem(id, validated);
      res.json(item);
    } catch (error) {
      console.error("Error updating reading list item:", error);
      res.status(400).json({ message: "Failed to update reading list item" });
    }
  });

  app.delete('/api/reading-list/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteReadingListItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reading list item:", error);
      res.status(500).json({ message: "Failed to delete reading list item" });
    }
  });

  // Analytics routes (Database-based)
  app.get('/api/analytics', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getArticleStats();
      res.json({ 
        totalViews: stats.totalViews,
        publishedCount: stats.publishedCount
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Track article view (public endpoint, rate limited)
  app.post('/api/articles/:slug/view', viewLimiter, async (req, res) => {
    try {
      const { slug } = req.params;
      await storage.incrementArticleViews(slug);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Travel History routes
  app.get('/api/travel-history', async (req, res) => {
    try {
      const entries = await storage.getTravelHistory();
      // Cache travel history for 5 minutes (stale-while-revalidate)
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.json(entries);
    } catch (error) {
      console.error("Error fetching travel history:", error);
      res.status(500).json({ message: "Failed to fetch travel history" });
    }
  });

  app.get('/api/travel-history/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const entry = await storage.getTravelHistoryEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Travel history entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching travel history entry:", error);
      res.status(500).json({ message: "Failed to fetch travel history entry" });
    }
  });

  app.post('/api/travel-history', isAdmin, async (req, res) => {
    try {
      const validated = insertTravelHistorySchema.parse(req.body);
      const entry = await storage.createTravelHistoryEntry(validated);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating travel history entry:", error);
      res.status(400).json({ message: "Failed to create travel history entry" });
    }
  });

  app.put('/api/travel-history/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const validated = insertTravelHistorySchema.partial().parse(req.body);
      const entry = await storage.updateTravelHistoryEntry(id, validated);
      res.json(entry);
    } catch (error) {
      console.error("Error updating travel history entry:", error);
      res.status(400).json({ message: "Failed to update travel history entry" });
    }
  });

  app.delete('/api/travel-history/:id', isAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteTravelHistoryEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting travel history entry:", error);
      res.status(500).json({ message: "Failed to delete travel history entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
