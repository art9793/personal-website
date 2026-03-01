import { insertSeoSettingsSchema } from "@shared/schema";
import { storage } from "../../../server/storage";
import { requireAdminUser } from "../_lib/auth";
import { csrfAllowed } from "../_lib/http";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const data = await storage.getSeoSettings();
  return Response.json(data ?? null);
}

export async function PUT(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const validated = insertSeoSettingsSchema.partial().parse(body);
  const updated = await storage.updateSeoSettings(validated);
  return Response.json(updated);
}
