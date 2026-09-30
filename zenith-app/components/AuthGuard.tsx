"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const hasDemoAccess = localStorage.getItem("hasDemoAccess");
    if (!hasDemoAccess) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}