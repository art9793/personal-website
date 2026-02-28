import { z } from "zod";
import { ObjectPermission } from "../../../server/objectAcl";
import { ObjectStorageService } from "../../../server/objectStorage";
import { requireAdminUser } from "../_lib/auth";
import { csrfAllowed } from "../_lib/http";

const schema = z.object({ imageURL: z.string().url() });

export async function PUT(request: Request) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const body = schema.parse(await request.json());
  const objectStorageService = new ObjectStorageService();
  const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(body.imageURL, {
    owner: user.id,
    visibility: "public",
    aclRules: [],
  });

  const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
  const canWrite = await objectStorageService.canAccessObjectEntity({
    userId: user.id,
    objectFile,
    requestedPermission: ObjectPermission.WRITE,
  });

  if (!canWrite) return Response.json({ message: "Forbidden" }, { status: 403 });
  return Response.json({ objectPath });
}
