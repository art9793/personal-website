import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}

function getBaseUrl() {
  if (process.env.DEPLOYMENT_URL) return process.env.DEPLOYMENT_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://arshad-teli.com";
}
