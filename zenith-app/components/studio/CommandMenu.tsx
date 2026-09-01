"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import {
  workspaceDestinations,
  workspaceEntryHref,
} from "@/lib/workspaceNavigation";

export default function CommandMenu({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const results = workspaceDestinations.filter((item) =>
    `${item.label} ${item.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  const openMenu = useCallback(() => {
    if (dialogRef.current?.open) return;
    setQuery("");
    setIsOpen(true);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const closeMenu = () => dialogRef.current?.close();

  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else openMenu();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openMenu]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const navigateResults = (event: KeyboardEvent, index: number) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      resultRefs.current[(index + 1) % results.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index <= 0) inputRef.current?.focus();
      else resultRefs.current[index - 1]?.focus();
    }
    if (event.key === "Enter" && index === -1) {
      event.preventDefault();
      resultRefs.current[0]?.click();
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={openMenu}
        className="command-trigger"
        aria-label="Search workspace tools"
        aria-haspopup="dialog"
      >
        <Search size={16} aria-hidden="true" />
        <span>Jump to a tool</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        ref={dialogRef}
        className="command-dialog studio"
        aria-labelledby="command-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
          }
        }}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="command-surface">
          <div className="command-header">
            <Command size={18} aria-hidden="true" />
            <h2 id="command-title">Where would you like to go?</h2>
            <button
              type="button"
              className="studio-icon-button"
              onClick={closeMenu}
              aria-label="Close tool search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="command-input">
            <Search size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              aria-label="Search tools"
              placeholder="Search tools, models, or scenarios..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => navigateResults(event, -1)}
              autoComplete="off"
            />
          </div>
          <div className="command-results">
            <p className="command-section-label">
              WORKSPACE TOOLS{" "}
              <span role="status">{results.length} results</span>
            </p>
            {results.length ? (
              results.map((item, index) => (
                <Link
                  key={item.href}
                  ref={(node) => {
                    resultRefs.current[index] = node;
                  }}
                  href={
                    authenticated ? item.href : workspaceEntryHref(item.href)
                  }
                  className="command-result"
                  onClick={closeMenu}
                  onKeyDown={(event) => navigateResults(event, index)}
                >
                  <span className="command-result-number">
                    0
                    {workspaceDestinations.findIndex(
                      (destination) => destination.href === item.href,
                    )}
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              ))
            ) : (
              <div className="command-empty">
                <Search size={25} aria-hidden="true" />
                <p>No tools match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
          <div className="command-footer">
            <span>↑ ↓ to navigate · Enter to open</span>
            <span>Esc to close</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
