/**
 * Simplified ACL layer for Vercel Blob.
 *
 * Vercel Blob objects are public-by-URL. ACL metadata is stored in an
 * in-memory map keyed by blob URL (sufficient for a single-admin portfolio).
 * For multi-tenant apps, persist this in the database instead.
 */

const ACL_STORE = new Map<string, ObjectAclPolicy>();

export type BlobMetaStore = typeof ACL_STORE;

export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission,
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

export async function setObjectAclPolicy(
  objectUrl: string,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  ACL_STORE.set(objectUrl, aclPolicy);
}

export async function getObjectAclPolicy(
  objectUrl: string,
): Promise<ObjectAclPolicy | null> {
  return ACL_STORE.get(objectUrl) ?? null;
}

export async function canAccessObject({
  userId,
  objectUrl,
  requestedPermission,
}: {
  userId?: string;
  objectUrl: string;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectUrl);

  // No ACL stored → treat as public (Vercel Blob default)
  if (!aclPolicy) return requestedPermission === ObjectPermission.READ;

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) return false;
  if (aclPolicy.owner === userId) return true;

  return false;
}
