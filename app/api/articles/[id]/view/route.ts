import { storage } from "../../../../../server/storage";
import { csrfAllowed, parseId } from "../../../_lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }

  const { id } = await params;
  const parsedId = parseId(id);

  // Backward-compatible: old clients call /api/articles/:slug/view.
  if (parsedId) {
    const article = await storage.getArticle(parsedId);
    if (article?.slug) {
      await storage.incrementArticleViews(article.slug);
      return Response.json({ ok: true });
    }
  }

  await storage.incrementArticleViews(id);
  return Response.json({ ok: true });
}
