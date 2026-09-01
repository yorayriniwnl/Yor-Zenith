import { cookies } from "next/headers";
import {
  credentialsAreConfigured,
  credentialsMatch,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin } from "@/lib/requestGuards";

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(request, 32 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const rateLimitError = enforceRateLimit(request, "auth-login", 10, 10 * 60 * 1000);
  if (rateLimitError) return rateLimitError;

  if (!credentialsAreConfigured()) {
    return Response.json(
      { error: "Authentication is not configured on this deployment." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (email.length > 254 || password.length > 256 || !email || !password) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!credentialsMatch(email, password)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("zenith_session", createSessionToken(email), sessionCookieOptions());
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
