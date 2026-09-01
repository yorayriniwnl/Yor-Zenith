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
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (active && !response.ok) router.replace("/login");
      })
      .catch(() => {
        if (active) router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  return <>{children}</>;
}
