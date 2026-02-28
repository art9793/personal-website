import { storage } from "../../../../../server/storage";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const article = await storage.getArticleBySlug(slug);
  if (!article) return Response.json({ message: "Article not found" }, { status: 404 });
  return Response.json(article);
}
