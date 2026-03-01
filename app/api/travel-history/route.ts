import { insertTravelHistorySchema } from "@shared/schema";
import { storage } from "../../../server/storage";
import { requireAdminUser } from "../_lib/auth";
import { csrfAllowed } from "../_lib/http";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const data = await storage.getTravelHistory();
  return Response.json(data);
}

export async function POST(request: Request) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const body = await request.json();
  const validated = insertTravelHistorySchema.parse(body);
  const created = await storage.createTravelHistoryEntry(validated);
  return Response.json(created);
}
