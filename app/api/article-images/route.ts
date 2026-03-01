import { ObjectStorageService } from "../../../server/objectStorage";
import { requireAdminUser } from "../_lib/auth";
import { csrfAllowed } from "../_lib/http";
import { z } from "zod";

const schema = z.object({ imageURL: z.string().min(1) });

export async function PUT(request: Request) {
  if (!csrfAllowed(request))
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });

  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const body = schema.parse(await request.json());
  const service = new ObjectStorageService();

  const objectPath = await service.trySetObjectEntityAclPolicy(body.imageURL, {
    owner: user.id,
    visibility: "public",
    aclRules: [],
  });

  return Response.json({ objectPath });
}
