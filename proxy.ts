import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const csp = [
  "default-src 'self'",
  // Next.js injects inline bootstrap/runtime scripts in production.
  // Blocking inline scripts prevents hydration and breaks client interactions.
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://*.public.blob.vercel-storage.com https://cloud.umami.is https://api-gateway.umami.dev",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://open.spotify.com https://codepen.io https://codesandbox.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (process.env.NODE_ENV !== "development") {
    response.headers.set("Content-Security-Policy", csp);
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
