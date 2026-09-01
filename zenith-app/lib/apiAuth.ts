import { getAuthSession } from "@/lib/auth";

export async function requireApiSession() {
  const session = await getAuthSession();
  if (session) return null;

  return Response.json({ error: "Authentication required" }, { status: 401 });
}
