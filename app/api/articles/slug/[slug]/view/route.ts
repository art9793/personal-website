import { storage } from "../../../../../../server/storage";
import { csrfAllowed } from "../../../../_lib/http";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const { slug } = await params;
  await storage.incrementArticleViews(slug);
  return Response.json({ ok: true });
}
