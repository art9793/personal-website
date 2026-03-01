function hasValue(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function parseHostname(raw: string): string | null {
  try {
    const value = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(value).hostname;
  } catch {
    return null;
  }
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

if (!hasValue("BLOB_READ_WRITE_TOKEN")) {
  warnings.push("BLOB_READ_WRITE_TOKEN not set — file uploads will not work.");
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
