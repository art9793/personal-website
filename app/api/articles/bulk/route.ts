import { z } from "zod";
import { storage } from "../../../../server/storage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed } from "../../_lib/http";

const bulkStatusSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  status: z.enum(["Draft", "Published"]),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export async function PATCH(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const validated = bulkStatusSchema.parse(body);
  const updatedCount = await storage.bulkUpdateArticleStatus(validated.ids, validated.status);
  return Response.json({ updatedCount });
}

export async function DELETE(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const validated = bulkDeleteSchema.parse(body);
  const deletedCount = await storage.bulkDeleteArticles(validated.ids);
  return Response.json({ deletedCount });
}
