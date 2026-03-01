import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";
import { rateLimit, getClientIp } from "../../_lib/rate-limit";

const handler = NextAuth(authOptions);

// Wrap POST to add rate limiting on login attempts
async function rateLimitedPost(request: Request, context: unknown) {
  const ip = getClientIp(request);

  // 5 login attempts per minute per IP
  const result = rateLimit(`auth:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });

  if (!result.success) {
    return Response.json(
      { message: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(result.resetMs / 1000)) },
      },
    );
  }

  return (handler as Function)(request, context);
}

export { handler as GET, rateLimitedPost as POST };
