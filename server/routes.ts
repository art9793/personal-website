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
  insertSeoSettingsSchema
} from "@shared/schema";

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
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

  // For same-origin requests, check Origin header
  const origin = req.headers.origin;
  const host = req.headers.host;
  const referer = req.headers.referer;

  // Allow requests from same origin
  if (origin && host && origin.includes(host)) {
    return next();
  }

  // Allow requests with referer from same origin
  if (referer && host && referer.includes(`https://${host}`)) {
    return next();
  }

  // In production, be more strict
  if (process.env.NODE_ENV === 'production') {
    // For API routes, require Origin header to match
    if (req.path.startsWith('/api') && origin) {
      const allowedOrigins = [
        process.env.DEPLOYMENT_URL,
        `https://${host}`,
        `http://${host}`,
      ].filter(Boolean);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return next();
      }
    }
  }

  // For development, be more lenient
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Default: allow (can be made stricter if needed)
  next();
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

  // Dynamic sitemap generation (before API routes to avoid rate limiting)
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = getDeploymentUrl();
      
      // Get all published articles
      const allArticles = await storage.getArticles();
      const publishedArticles = allArticles
        .filter(a => a.status === 'Published' && a.slug)
        .sort((a, b) => {
          const dateA = a.updatedAt || a.publishedAt || a.createdAt;
          const dateB = b.updatedAt || b.publishedAt || b.createdAt;
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeB - timeA; // Most recent first
        });
      
      // Get all active projects
      const allProjects = await storage.getProjects();
      const activeProjects = allProjects
        .filter(p => p.status === 'Active')
        .sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA; // Most recent first
        });
      
      // Get profile for lastmod date
      const profile = await storage.getProfile();
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

      res.set('Content-Type', 'application/xml');
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
      const objectStorageService = new ObjectStorageService();
      const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL, objectPath });
    } catch (error) {
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
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(400).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/articles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, validated);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(400).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/articles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
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
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validated);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
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
      res.json(workExperiences);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      res.status(500).json({ message: "Failed to fetch work experiences" });
    }
  });

  app.get('/api/work-experiences/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      res.json(items);
    } catch (error) {
      console.error("Error fetching reading list:", error);
      res.status(500).json({ message: "Failed to fetch reading list" });
    }
  });

  app.get('/api/reading-list/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
      await storage.deleteReadingListItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reading list item:", error);
      res.status(500).json({ message: "Failed to delete reading list item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
