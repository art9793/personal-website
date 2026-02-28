import { storage } from "../../../server/storage";
import { requireAdminUser } from "../_lib/auth";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const stats = await storage.getArticleStats();
  return Response.json(stats);
}
