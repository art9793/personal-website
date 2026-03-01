import { insertProfileSchema } from "@shared/schema";
import { storage } from "../../../server/storage";
import { csrfAllowed } from "../_lib/http";
import { requireAdminUser } from "../_lib/auth";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const profile = await storage.getProfile();
  return Response.json(profile ?? null);
}

export async function PUT(request: Request) {
  if (!csrfAllowed(request)) {
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  }

  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const validated = insertProfileSchema.partial().parse(body);
  const updated = await storage.updateProfile(validated);
  return Response.json(updated);
}
