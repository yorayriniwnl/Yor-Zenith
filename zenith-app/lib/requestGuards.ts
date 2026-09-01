export function enforceBodyLimit(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return null;

  const parsedLength = Number(contentLength);
  if (!Number.isFinite(parsedLength) || parsedLength < 0) {
    return Response.json({ error: "Invalid content length" }, { status: 400 });
  }

  if (parsedLength > maxBytes) {
    return Response.json(
      { error: `Request body must be smaller than ${Math.round(maxBytes / 1024)} KB` },
      { status: 413 },
    );
  }

  return null;
}

export function enforceSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return null;

  try {
    const origin = new URL(originHeader);
    const requestHost = request.headers.get("host");
    if (!requestHost || origin.host !== requestHost) {
      return Response.json({ error: "Cross-origin request blocked" }, { status: 403 });
    }
  } catch {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Upstream request timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
