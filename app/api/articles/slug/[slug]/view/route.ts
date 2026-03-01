import { storage } from "../../../../../../server/storage";
import { csrfAllowed } from "../../../../_lib/http";
import { rateLimit, getClientIp } from "../../../../_lib/rate-limit";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }

  const { slug } = await params;
  const ip = getClientIp(request);

  // 1 view per slug per IP per minute
  const result = rateLimit(`view:${slug}:${ip}`, {
    limit: 1,
    windowMs: 60_000,
  });

  if (!result.success) {
    return Response.json({ ok: true }); // Silent success to avoid leaking rate limit info
  }

  await storage.incrementArticleViews(slug);
  return Response.json({ ok: true });
}
