import { ObjectStorageService } from "../../../../server/objectStorage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed } from "../../_lib/http";

export async function POST(request: Request) {
  if (!csrfAllowed(request)) return Response.json({ message: "CSRF validation failed" }, { status: 403 });
  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const contentType = request.headers.get("content-type") ?? undefined;
  const objectStorageService = new ObjectStorageService();
  const data = await objectStorageService.getObjectEntityUploadURL(contentType);
  return Response.json(data);
}
