import { ObjectStorageService } from "../../../../server/objectStorage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed } from "../../_lib/http";

export async function POST(request: Request) {
  if (!csrfAllowed(request))
    return Response.json({ message: "CSRF validation failed" }, { status: 403 });

  const authResult = await requireAdminUser();
  if (authResult.error) return authResult.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return Response.json({ message: "No file provided" }, { status: 400 });
  }

  const contentType =
    (file as File).type || request.headers.get("content-type") || undefined;

  const service = new ObjectStorageService();
  const result = await service.uploadObject(file, contentType);

  return Response.json(result);
}
