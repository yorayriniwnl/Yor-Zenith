"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return mounted ? <>{children}</> : <>{fallback}</>;
}
