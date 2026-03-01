import { ObjectStorageService, ObjectNotFoundError } from "../../../server/objectStorage";

interface Params {
  params: Promise<{ objectPath: string[] }>;
}

export async function GET(_: Request, { params }: Params) {
  const resolved = await params;
  const objectPath = `/objects/${(resolved.objectPath ?? []).join("/")}`;

  const service = new ObjectStorageService();
  const blobUrl = await service.resolveObjectPath(objectPath);

  if (!blobUrl) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.redirect(blobUrl, 302);
}
