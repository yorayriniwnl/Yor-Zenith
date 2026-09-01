"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, LogOut, Menu, Sun, X } from "lucide-react";
import {
  isWorkspacePath,
  workspaceDestinations,
  workspaceEntryHref,
} from "@/lib/workspaceNavigation";
import CommandMenu from "@/components/studio/CommandMenu";

const marketingLinks = [
  { href: "/#features", label: "The studio" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#testimonials", label: "Our approach" },
  { href: "/#pricing", label: "Access" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isWorkspace = isWorkspacePath(pathname);
  const currentTool = workspaceDestinations.find(
    (item) => item.href === pathname,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionNotice, setSessionNotice] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const syncSession = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        signal,
      });
      if (!signal?.aborted) setIsLoggedIn(response.ok);
    } catch {
      if (!signal?.aborted) setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void syncSession(controller.signal);
    const onAuthChange = () => void syncSession(controller.signal);
    window.addEventListener("auth-changed", onAuthChange);
    return () => {
      controller.abort();
      window.removeEventListener("auth-changed", onAuthChange);
    };
  }, [pathname, syncSession]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !navRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsSigningOut(true);
    setSessionNotice("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign-out failed. Please try again.");
      setIsLoggedIn(false);
      setIsOpen(false);
      window.dispatchEvent(new Event("auth-changed"));
      router.replace("/");
      router.refresh();
    } catch (error) {
      setSessionNotice(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      ref={navRef}
      className={`studio site-header ${isWorkspace ? "workspace-header" : ""}`}
    >
      <div className="site-header-inner">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="studio-brand"
          aria-label="Zenith home"
        >
          <span className="brand-symbol">
            <Sun size={23} aria-hidden="true" />
          </span>
          zenith<span className="brand-period">.</span>
        </Link>
        {isWorkspace ? (
          <div className="workspace-breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>{currentTool?.label ?? "Overview"}</strong>
          </div>
        ) : (
          <nav className="marketing-navigation" aria-label="Main navigation">
            {marketingLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="header-actions">
          <CommandMenu authenticated={isLoggedIn} />
          {isWorkspace ? (
            <button
              type="button"
              className="studio-icon-button signout-button"
              onClick={() => void handleLogout()}
              disabled={isSigningOut}
              aria-label={isSigningOut ? "Signing out" : "Sign out"}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          ) : (
            <Link
              href={isLoggedIn ? "/dashboard" : workspaceEntryHref("/service1")}
              className="header-cta"
            >
              {isLoggedIn ? "Workspace" : "Get started"}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
          {!isWorkspace && (
            <button
              ref={menuTriggerRef}
              type="button"
              className="studio-icon-button mobile-menu-trigger"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
            >
              {isOpen ? (
                <X size={21} aria-hidden="true" />
              ) : (
                <Menu size={21} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
      {isOpen && !isWorkspace && (
        <nav
          id="mobile-navigation"
          className="mobile-marketing-navigation"
          aria-label="Mobile navigation"
        >
          {marketingLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
          <Link href="/login" onClick={() => setIsOpen(false)}>
            Sign in to your workspace
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isSigningOut}
            >
              Sign out
            </button>
          )}
        </nav>
      )}
      {sessionNotice && (
        <div className="header-notice" role="alert">
          {sessionNotice}
        </div>
      )}
    </header>
  );
}
