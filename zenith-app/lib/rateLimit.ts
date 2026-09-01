type Bucket = { count: number; resetAt: number };
const MAX_BUCKETS = 10_000;

const globalState = globalThis as typeof globalThis & {
  __zenithRateLimitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalState.__zenithRateLimitBuckets ?? new Map<string, Bucket>();
globalState.__zenithRateLimitBuckets = buckets;

export function enforceRateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();

  // Forwarding headers are only trustworthy when the deployment's edge proxy
  // strips and rewrites them. Keep them opt-in so a browser cannot spoof a new
  // identity for every request by default.
  const trustProxyHeaders = process.env.ZENITH_TRUST_PROXY_HEADERS === "true";
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const clientKey = trustProxyHeaders ? (realIp || forwardedFor || "unknown") : "shared";
  const key = `${namespace}:${clientKey}`;

  // Expire old buckets and cap memory usage so spoofed headers cannot grow the
  // process-local map forever.
  for (const [bucketKey, bucketValue] of buckets) {
    if (bucketValue.resetAt <= now) buckets.delete(bucketKey);
  }
  if (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }

  const existing = buckets.get(key);
  const bucket = existing && existing.resetAt > now
    ? existing
    : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count <= limit) return null;

  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) },
    }
  );
}
