import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin that updates og:image and twitter:image meta tags
 * to point to the app's opengraph image with the correct deployment domain.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    transformIndexHtml(html) {
      const baseUrl = getDeploymentUrl();
      if (!baseUrl) {
        log('[meta-images] no deployment domain found, skipping meta tag updates');
        return html;
      }

      // Check if opengraph image exists in public directory
      // In Vite, the root is set to client/, so public is at ./public relative to root
      // But we need to resolve from the project root, so use process.cwd()
      const projectRoot = process.cwd();
      const publicDir = path.resolve(projectRoot, 'client', 'public');
      const opengraphPngPath = path.join(publicDir, 'opengraph.png');
      const opengraphJpgPath = path.join(publicDir, 'opengraph.jpg');
      const opengraphJpegPath = path.join(publicDir, 'opengraph.jpeg');
      const faviconPngPath = path.join(publicDir, 'favicon.png');

      let imageName: string | null = null;
      if (fs.existsSync(opengraphPngPath)) {
        imageName = 'opengraph.png';
      } else if (fs.existsSync(opengraphJpgPath)) {
        imageName = 'opengraph.jpg';
      } else if (fs.existsSync(opengraphJpegPath)) {
        imageName = 'opengraph.jpeg';
      } else if (fs.existsSync(faviconPngPath)) {
        // Fallback to favicon.png if no opengraph image exists
        imageName = 'favicon.png';
      }

      if (!imageName) {
        log('[meta-images] No suitable image found, skipping meta tag updates');
        return html;
      }

      const imageUrl = `${baseUrl}/${imageName}`;

      log('[meta-images] updating meta image tags to:', imageUrl);

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imageUrl}" />`
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imageUrl}" />`
      );

      return html;
    },
  };
}

function getDeploymentUrl(): string | null {
  // Check for explicit deployment URL first
  if (process.env.DEPLOYMENT_URL) {
    const url = process.env.DEPLOYMENT_URL;
    log('[meta-images] using DEPLOYMENT_URL:', url);
    return url;
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    log('[meta-images] using Vercel URL:', url);
    return url;
  }

  // Railway
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    const url = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    log('[meta-images] using Railway domain:', url);
    return url;
  }

  // Fly.io
  if (process.env.FLY_APP_NAME) {
    const url = `https://${process.env.FLY_APP_NAME}.fly.dev`;
    log('[meta-images] using Fly.io URL:', url);
    return url;
  }

  return null;
}

function log(...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    console.log(...args);
  }
}
