import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";
import { enforceSameOrigin } from "@/lib/requestGuards";

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return Response.json({ ok: true });
}
