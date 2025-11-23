import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { 
  insertProfileSchema,
  insertArticleSchema,
  insertProjectSchema,
  insertWorkExperienceSchema,
  insertReadingListSchema,
  insertSeoSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object Storage routes (Reference: blueprint:javascript_object_storage)
  // Endpoint for getting upload URL (admin only)
  app.post('/api/objects/upload', isAdmin, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
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

    const userId = req.user?.claims?.sub;
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

  // Endpoint for serving uploaded objects (public read for article images)
  app.get('/objects/:objectPath(*)', async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
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
