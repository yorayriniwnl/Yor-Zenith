"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUpRight, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { id: "get-started", label: "Start" },
  { id: "features", label: "Signals" },
  { id: "how-it-works", label: "Method" },
  { id: "intelligence", label: "Intelligence" },
  { id: "pricing", label: "Access" },
  { id: "faq", label: "FAQ" },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasDemoAccess, setHasDemoAccess] = useState(() => typeof window !== "undefined" && localStorage.getItem("demoAccess") === "true")

  const syncDemoAccessState = useCallback(() => {
    setHasDemoAccess(localStorage.getItem("demoAccess") === "true")
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => syncDemoAccessState()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("demo-access-changed", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("demo-access-changed", handleStorageChange)
    }
  }, [syncDemoAccessState])

  const handleExitDemo = () => {
    localStorage.removeItem("demoAccess")
    localStorage.removeItem("redirectAfterDemoAccess")
    setHasDemoAccess(false)
    window.dispatchEvent(new Event("demo-access-changed"))
    router.push("/")
  }

  const scrollToId = (id: string) => {
    setIsOpen(false)
    if (pathname !== "/") {
      router.push(`/#${id}`)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className={`yor-nav fixed top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled ? "yor-nav--scrolled py-3" : "py-4"}`}>
      <div className="yor-nav__inner flex items-center justify-between gap-4">
        <Link href="/" className="yor-brand" aria-label="Zenith home">
          <span className="yor-brand__mark" aria-hidden="true">Z</span>
          <span>
            <span className="yor-brand__name">ZENITH</span>
            <span className="yor-brand__sub">solar decision intelligence</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <button key={link.id} onClick={() => scrollToId(link.id)} className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--yor-muted)] transition-colors hover:text-[var(--yor-white)]">
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="yor-state yor-state--hot">BETA / INDIA</span>
          {!hasDemoAccess ? (
            <button onClick={() => router.push("/login")} className="yor-button yor-button--quiet px-4 py-2">
              Enter demo <ArrowUpRight size={14} />
            </button>
          ) : (
            <button onClick={handleExitDemo} className="yor-button yor-button--quiet px-4 py-2">Exit demo</button>
          )}
        </div>

        <button className="yor-button !min-h-0 border-0 bg-transparent p-2 hover:bg-white/5 lg:hidden" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="yor-nav__inner mt-3 rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl lg:hidden">
          <div className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <button key={link.id} onClick={() => scrollToId(link.id)} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-[var(--yor-muted)] hover:bg-white/5 hover:text-[var(--yor-white)]">
                {link.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 sm:hidden">
            {!hasDemoAccess ? (
              <button onClick={() => { setIsOpen(false); router.push("/login") }} className="yor-button yor-button--primary w-full">Enter demo <ArrowUpRight size={14} /></button>
            ) : (
              <button onClick={handleExitDemo} className="yor-button yor-button--quiet w-full">Exit demo</button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}