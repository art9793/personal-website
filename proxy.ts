import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://*.public.blob.vercel-storage.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://open.spotify.com https://codepen.io https://codesandbox.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (process.env.NODE_ENV !== "development") {
    response.headers.set("Content-Security-Policy", csp);
    // #region agent log
    fetch('http://127.0.0.1:7345/ingest/c84c0792-e3a2-4b36-b107-2a948a4255a2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'858265'},body:JSON.stringify({sessionId:'858265',runId:'run1',hypothesisId:'H1',location:'proxy.ts:24',message:'CSP header applied',data:{pathname:request.nextUrl.pathname,hasUnsafeInline:csp.includes(\"'unsafe-inline'\"),scriptSrc:csp.includes('script-src')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
