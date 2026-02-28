import { insertArticleSchema } from "@shared/schema";
import { storage } from "../../../server/storage";
import { requireAdminUser } from "../_lib/auth";
import { csrfAllowed } from "../_lib/http";

export async function GET() {
  const data = await storage.getArticles();
  return Response.json(data);
}

export async function POST(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const validated = insertArticleSchema.parse(body);
  const created = await storage.createArticle(validated);
  return Response.json(created);
}
