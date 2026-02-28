import type { MetadataRoute } from "next";
import { storage } from "../server/storage";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [articles, projects, profile] = await Promise.all([
    storage.getPublishedArticles().catch(() => []),
    storage.getActiveProjects().catch(() => []),
    storage.getProfile().catch(() => undefined),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/writing` },
    { url: `${baseUrl}/projects` },
    { url: `${baseUrl}/reading` },
    { url: `${baseUrl}/travel` },
    { url: `${baseUrl}/work` },
  ];

  const articlePages = articles
    .filter((a) => a.slug)
    .map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt ?? article.createdAt ?? undefined,
    }));

  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/projects`,
    lastModified: project.updatedAt ?? project.createdAt ?? undefined,
  }));

  if (profile?.updatedAt) {
    staticPages[0].lastModified = profile.updatedAt;
  }

  return [...staticPages, ...articlePages, ...projectPages];
}

function getBaseUrl() {
  if (process.env.DEPLOYMENT_URL) return process.env.DEPLOYMENT_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  return "https://arshad-teli.com";
}
