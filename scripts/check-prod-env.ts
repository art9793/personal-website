function parseHostname(raw: string): string | null {
  try {
    const value = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function hasValue(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

const requiredOneOf = [["NEXTAUTH_SECRET", "AUTH_SECRET"]];
const requiredAll = ["DATABASE_URL"];

const missing: string[] = [];
const warnings: string[] = [];

for (const key of requiredAll) {
  if (!hasValue(key)) missing.push(key);
}

for (const keys of requiredOneOf) {
  if (!keys.some(hasValue)) {
    missing.push(`${keys.join(" | ")}`);
  }
}

const databaseUrl = process.env.DATABASE_URL ?? "";
if (databaseUrl) {
  if (!parseHostname(databaseUrl)) {
    missing.push("DATABASE_URL (invalid URL)");
  }

  if (!/sslmode=/.test(databaseUrl)) {
    warnings.push("DATABASE_URL does not set sslmode. Prefer sslmode=verify-full in production.");
  }
}

const usesObjectStorage = hasValue("PRIVATE_OBJECT_DIR") || hasValue("PUBLIC_OBJECT_SEARCH_PATHS");
if (usesObjectStorage) {
  if (!hasValue("PRIVATE_OBJECT_DIR")) missing.push("PRIVATE_OBJECT_DIR");
  if (!hasValue("PUBLIC_OBJECT_SEARCH_PATHS")) missing.push("PUBLIC_OBJECT_SEARCH_PATHS");
  if (!hasValue("GOOGLE_CLOUD_CREDENTIALS") && !hasValue("GOOGLE_APPLICATION_CREDENTIALS")) {
    missing.push("GOOGLE_CLOUD_CREDENTIALS | GOOGLE_APPLICATION_CREDENTIALS");
  }
}

if (missing.length > 0) {
  console.error("❌ Production env check failed.");
  for (const key of missing) console.error(`- Missing: ${key}`);
  process.exit(1);
}

console.log("✅ Production env check passed.");
if (warnings.length > 0) {
  for (const warning of warnings) console.warn(`⚠ ${warning}`);
}
