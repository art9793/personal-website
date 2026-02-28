import { insertProjectSchema } from "@shared/schema";
import { storage } from "../../../../server/storage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed, parseId } from "../../_lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid project id" }, { status: 400 });
  const project = await storage.getProject(parsedId);
  if (!project) return Response.json({ message: "Project not found" }, { status: 404 });
  return Response.json(project);
}

export async function PUT(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid project id" }, { status: 400 });
  const body = await request.json();
  const validated = insertProjectSchema.partial().parse(body);
  const updated = await storage.updateProject(parsedId, validated);
  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;
  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) return Response.json({ message: "Invalid project id" }, { status: 400 });
  await storage.deleteProject(parsedId);
  return Response.json({ ok: true });
}
