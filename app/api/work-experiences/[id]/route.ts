import { insertWorkExperienceSchema } from "@shared/schema";
import { storage } from "../../../../server/storage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed, parseId } from "../../_lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid work experience id" }, { status: 400 });
  const item = await storage.getWorkExperience(parsedId);
  if (!item) return Response.json({ message: "Work experience not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid work experience id" }, { status: 400 });
  const body = await request.json();
  const validated = insertWorkExperienceSchema.partial().parse(body);
  const updated = await storage.updateWorkExperience(parsedId, validated);
  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid work experience id" }, { status: 400 });
  await storage.deleteWorkExperience(parsedId);
  return Response.json({ ok: true });
}
