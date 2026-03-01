import { put, del, head, list } from "@vercel/blob";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
  type BlobMetaStore,
} from "./objectAcl";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export class ObjectStorageService {
  /**
   * Upload a file to Vercel Blob and return its public URL.
   */
  async uploadObject(
    body: Buffer | ReadableStream | Blob | ArrayBuffer,
    contentType?: string,
  ): Promise<{ url: string; objectPath: string }> {
    if (
      contentType &&
      !ALLOWED_CONTENT_TYPES.includes(contentType)
    ) {
      throw new Error(
        `File type not allowed. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
      );
    }

    const id = randomUUID();
    const ext = contentType ? mimeToExt(contentType) : "";
    const pathname = `uploads/${id}${ext}`;

    const blob = await put(pathname, body, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    return { url: blob.url, objectPath: blob.url };
  }

  /**
   * Check whether a blob URL exists in the store.
   */
  async headObject(url: string): Promise<{ url: string; contentType: string } | null> {
    try {
      const meta = await head(url);
      return { url: meta.url, contentType: meta.contentType };
    } catch {
      return null;
    }
  }

  /**
   * Delete a blob by its URL.
   */
  async deleteObject(url: string): Promise<void> {
    await del(url);
  }

  /**
   * Resolve a legacy `/objects/*` path to a Vercel Blob URL by listing the store.
   * Falls back to null if not found.
   */
  async resolveObjectPath(objectPath: string): Promise<string | null> {
    if (objectPath.startsWith("https://")) return objectPath;

    const stripped = objectPath.replace(/^\/objects\//, "");
    const result = await list({ prefix: stripped, limit: 1 });
    if (result.blobs.length > 0) return result.blobs[0].url;
    return null;
  }

  /**
   * Normalise any raw path (legacy GCS URL, /objects/* path, or blob URL) to the
   * canonical form we store in the database (the full Vercel Blob URL for new
   * uploads, or a /objects/* relative path for legacy references).
   */
  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.includes(".blob.vercel-storage.com")) return rawPath;

    if (rawPath.startsWith("https://storage.googleapis.com/")) {
      try {
        const url = new URL(rawPath);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          return "/objects/" + parts.slice(1).join("/");
        }
      } catch { /* fall through */ }
    }

    return rawPath;
  }

  /**
   * Set ACL metadata on a blob and return the normalised path.
   */
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    await setObjectAclPolicy(normalizedPath, aclPolicy);
    return normalizedPath;
  }

  /**
   * Check whether a user can access a given object.
   */
  async canAccessObjectEntity({
    userId,
    objectUrl,
    requestedPermission,
  }: {
    userId?: string;
    objectUrl: string;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectUrl,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
  };
  return map[mime] ?? "";
}
