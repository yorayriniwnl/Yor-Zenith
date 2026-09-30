"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function DemoAccessPage() {
  const router = useRouter()

  const enterDemo = () => {
    localStorage.setItem("demoAccess", "true")
    window.dispatchEvent(new Event("demo-access-changed"))
    const redirectPath = localStorage.getItem("redirectAfterDemoAccess")
    localStorage.removeItem("redirectAfterDemoAccess")
    router.replace(redirectPath || "/")
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-12 pt-32 sm:px-8">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.82fr,1.18fr]">
        <section className="hidden flex-col justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(103,21,21,0.32),rgba(5,5,5,0.88))] p-8 lg:flex">
          <div>
            <p className="yor-technical text-[var(--yor-warm)]">zenith / demo boundary</p>
            <h1 className="yor-display mt-6 text-5xl text-[var(--yor-white)]">Inspect the decision trail.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--yor-muted)]">
              The analysis modules are a public demonstration. This gate keeps the walkthrough together; it is not authentication or access control.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="yor-readout"><p className="yor-readout__label">surface</p><p className="mt-2 text-sm text-[var(--yor-white)]">public demo</p></div>
            <div className="yor-readout"><p className="yor-readout__label">status</p><p className="mt-2 text-sm text-[var(--yor-warm)]">DEMO / ACTIVE</p></div>
          </div>
        </section>

        <section className="yor-panel p-6 sm:p-9">
          <button type="button" onClick={() => router.push("/")} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--yor-muted)] hover:text-[var(--yor-white)]">
            <ArrowLeft size={14} /> return to signal map
          </button>
          <div className="mt-10">
            <p className="yor-technical text-[var(--yor-warm)]">demo access / 00</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--yor-white)]">Open Zenith</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--yor-muted)]">
              Continue into the public analysis walkthrough. No account, password, or protected session is created.
            </p>
          </div>

          <button type="button" onClick={enterDemo} className="yor-button yor-button--primary mt-8 w-full">
            Enter demo workspace <ArrowRight size={16} />
          </button>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="yor-technical">boundary</p>
            <p className="mt-2 text-xs leading-5 text-[var(--yor-muted)]">
              A browser-local demo flag only preserves navigation state. It must never be used to protect private data or privileged operations.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
