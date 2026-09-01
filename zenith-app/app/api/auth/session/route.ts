import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return Response.json({ authenticated: false }, { status: 401 });

  return Response.json({
    authenticated: true,
    user: { email: session.email, role: session.role },
  });
}
