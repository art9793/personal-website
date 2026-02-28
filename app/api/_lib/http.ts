export function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id) || id <= 0) return null;
  return id;
}

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function csrfAllowed(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  if (process.env.NODE_ENV === "development") return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host")?.split(":")[0];

  const trustedHosts = new Set<string>();
  if (host) trustedHosts.add(host);
  if (process.env.DEPLOYMENT_URL) {
    try {
      trustedHosts.add(new URL(process.env.DEPLOYMENT_URL).hostname);
    } catch {}
  }

  if (origin) {
    try {
      if (trustedHosts.has(new URL(origin).hostname)) return true;
    } catch {}
  }
  if (referer) {
    try {
      if (trustedHosts.has(new URL(referer).hostname)) return true;
    } catch {}
  }

  return process.env.NODE_ENV !== "production";
}
