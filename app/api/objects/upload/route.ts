import { ObjectStorageService } from "../../../../server/objectStorage";
import { requireAdminUser } from "../../_lib/auth";
import { csrfAllowed } from "../../_lib/http";

/** Known image magic byte signatures */
const IMAGE_SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header; "WEBP" at offset 8 checked below
  { mime: "image/svg+xml", bytes: [] }, // checked via text content below
];

function detectImageMime(header: Uint8Array): string | null {
  // JPEG
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return "image/gif";
  }
  // WebP (RIFF....WEBP)
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header.length >= 12 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return "image/webp";
  }
  // SVG (check for XML/SVG text)
  const text = new TextDecoder().decode(header.slice(0, 256));
  if (text.includes("<svg") || text.includes("<?xml")) {
    return "image/svg+xml";
  }
  return null;
}

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

  // Server-side MIME validation via magic bytes
  const buffer = await file.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 256));
  const detectedMime = detectImageMime(header);

  if (!detectedMime) {
    return Response.json(
      { message: "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed." },
      { status: 400 },
    );
  }

  // Use the detected MIME type (trusted) rather than the client-provided one
  const service = new ObjectStorageService();
  const result = await service.uploadObject(file, detectedMime);

  return Response.json(result);
}
