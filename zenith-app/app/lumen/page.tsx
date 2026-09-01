import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LegacyLumenRedirect() {
  const session = await getAuthSession();
  redirect(session ? "/service5" : "/login?next=%2Fservice5");
}
