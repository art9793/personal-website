// Reference: blueprint:javascript_object_storage
import { Storage, File } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import path from "path";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// Initialize Google Cloud Storage client
// Supports multiple credential methods for different deployment environments
function getStorageClient(): Storage {
  // Option 1: Use service account JSON from environment variable (recommended for deployment)
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      return new Storage({
        projectId: credentials.project_id,
        credentials: credentials,
      });
    } catch (error) {
      console.error("Failed to parse GOOGLE_CLOUD_CREDENTIALS:", error);
      throw new Error("Invalid GOOGLE_CLOUD_CREDENTIALS JSON");
    }
  }
  
  // Option 2: Use service account file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  
  // Option 3: Use default credentials (if running on GCP or with gcloud auth)
  // This will work if you're running on Google Cloud or have authenticated locally
  try {
    return new Storage();
  } catch (error) {
    throw new Error(
      "Google Cloud Storage credentials not configured. " +
      "Set GOOGLE_CLOUD_CREDENTIALS (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path). " +
      "For local development, you can also use 'gcloud auth application-default login'"
    );
  }
}

let objectStorageClient: Storage | null = null;

function getObjectStorageClient(): Storage {
  if (!objectStorageClient) {
    objectStorageClient = getStorageClient();
  }
  return objectStorageClient;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service is used to interact with the object storage service.
export class ObjectStorageService {
  constructor() {}

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  // Search for a public object from the search paths.
  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      // Full path format: /<bucket_name>/<object_name>
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = getObjectStorageClient().bucket(bucketName);
      const file = bucket.file(objectName);

      // Check if file exists
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  private static ALLOWED_CONTENT_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
  ];

  private static MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(contentType?: string): Promise<{ uploadURL: string; objectPath: string }> {
    if (contentType && !ObjectStorageService.ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new Error(`File type not allowed. Allowed types: ${ObjectStorageService.ALLOWED_CONTENT_TYPES.join(', ')}`);
    }
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    // Sign URL for PUT method with TTL
    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
      contentType,
      maxContentLength: ObjectStorageService.MAX_UPLOAD_SIZE,
    });
    
    // Return both the upload URL and the normalized object path
    const objectPath = `/objects/uploads/${objectId}`;
    
    return { uploadURL, objectPath };
  }

  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    const decodedEntityId = decodeURIComponent(entityId);
    const normalized = path.normalize(decodedEntityId);
    if (normalized.includes("..") || normalized.startsWith("/") || decodedEntityId.includes("..")) {
      throw new ObjectNotFoundError();
    }
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = getObjectStorageClient().bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(
    rawPath: string,
  ): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
  
    // Extract the path from the URL by removing query parameters and domain
    const url = new URL(rawPath);
    let rawObjectPath = url.pathname;
    
    // Remove leading slash and bucket name from pathname
    // pathname format: /{bucketName}/{objectPath}
    const parts = rawObjectPath.split('/').filter(Boolean);
    if (parts.length >= 2) {
      // Remove bucket name (first part) and reconstruct path
      rawObjectPath = '/' + parts.slice(1).join('/');
    }
  
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
  
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
  
    // Extract the entity ID from the path
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
  contentType,
  maxContentLength,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
  contentType?: string;
  maxContentLength?: number;
}): Promise<string> {
  const bucket = getObjectStorageClient().bucket(bucketName);
  const file = bucket.file(objectName);

  // Map HTTP methods to GCS signed URL actions
  const actionMap: Record<string, 'read' | 'write' | 'delete' | 'resumable'> = {
    'GET': 'read',
    'PUT': 'write',
    'DELETE': 'delete',
    'HEAD': 'read',
  };

  const action = actionMap[method] || 'read';

  const options: Parameters<typeof file.getSignedUrl>[0] = {
    version: 'v4',
    action: action,
    expires: Date.now() + ttlSec * 1000,
  };

  if (contentType) {
    options.contentType = contentType;
  }

  if (maxContentLength) {
    options.extensionHeaders = {
      'x-goog-content-length-range': `0,${maxContentLength}`,
    };
  }

  const [url] = await file.getSignedUrl(options);

  return url;
}
