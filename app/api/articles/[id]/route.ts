import { insertArticleSchema } from "@shared/schema";
import { storage } from "../../../../server/storage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed, parseId } from "../../_lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid article id" }, { status: 400 });
  const article = await storage.getArticle(parsedId);
  if (!article) return Response.json({ message: "Article not found" }, { status: 404 });
  return Response.json(article);
}

export async function PUT(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid article id" }, { status: 400 });

  const body = await request.json();
  const validated = insertArticleSchema.partial().parse(body);
  const updated = await storage.updateArticle(parsedId, validated);
  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid article id" }, { status: 400 });

  await storage.deleteArticle(parsedId);
  return Response.json({ ok: true });
}
