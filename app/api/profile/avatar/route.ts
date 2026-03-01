import { z } from "zod";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed } from "../../_lib/http";
import { storage } from "../../../../server/storage";
import { ObjectStorageService } from "../../../../server/objectStorage";

const schema = z.object({ objectPath: z.string().min(1) });

export async function PUT(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = schema.parse(await request.json());
  const service = new ObjectStorageService();
  const normalizedPath = service.normalizeObjectEntityPath(body.objectPath);

  const updated = await storage.updateProfile({ avatarUrl: normalizedPath });
  return Response.json({ avatarUrl: updated.avatarUrl });
}

export async function DELETE(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  await storage.updateProfile({ avatarUrl: null });
  return Response.json({ ok: true });
}
