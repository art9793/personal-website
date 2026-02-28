import { ObjectPermission } from "../../../server/objectAcl";
import { ObjectNotFoundError, ObjectStorageService } from "../../../server/objectStorage";
import { getSessionUser } from "../../api/_lib/auth";

interface Params {
  params: Promise<{ objectPath: string[] }>;
}

export async function GET(_: Request, { params }: Params) {
  const objectStorageService = new ObjectStorageService();
  const resolved = await params;
  const objectPath = `/objects/${(resolved.objectPath ?? []).join("/")}`;

  try {
    const user = await getSessionUser();

    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      const canRead = await objectStorageService.canAccessObjectEntity({
        userId: user?.id,
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canRead) return Response.json({ message: "Forbidden" }, { status: 403 });

      const [buffer] = await objectFile.download();
      const [metadata] = await objectFile.getMetadata();
      return new Response(buffer, {
        headers: {
          "Content-Type": metadata.contentType || "application/octet-stream",
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (err) {
      if (!(err instanceof ObjectNotFoundError)) throw err;
      const publicFile = await objectStorageService.searchPublicObject((resolved.objectPath ?? []).join("/"));
      if (!publicFile) return Response.json({ message: "Not found" }, { status: 404 });
      const [buffer] = await publicFile.download();
      const [metadata] = await publicFile.getMetadata();
      return new Response(buffer, {
        headers: {
          "Content-Type": metadata.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {
    return Response.json({ message: "Not found" }, { status: 404 });
  }
}
