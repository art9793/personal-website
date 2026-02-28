import { insertTravelHistorySchema } from "@shared/schema";
import { storage } from "../../../../server/storage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed, parseId } from "../../_lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid travel history id" }, { status: 400 });
  const item = await storage.getTravelHistoryEntry(parsedId);
  if (!item) return Response.json({ message: "Travel history entry not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid travel history id" }, { status: 400 });
  const body = await request.json();
  const validated = insertTravelHistorySchema.partial().parse(body);
  const updated = await storage.updateTravelHistoryEntry(parsedId, validated);
  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid travel history id" }, { status: 400 });
  await storage.deleteTravelHistoryEntry(parsedId);
  return Response.json({ ok: true });
}
