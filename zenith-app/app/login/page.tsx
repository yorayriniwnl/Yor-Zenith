import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { safeWorkspaceDestination } from "@/lib/workspaceNavigation";
import LoginForm from "@/components/studio/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  const returnTo = safeWorkspaceDestination(query.next);
  const session = await getAuthSession();
  if (session) redirect(returnTo);
  return <LoginForm returnTo={returnTo} />;
}
