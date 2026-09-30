"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  ScanLine,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react"

const SIGNALS = [
  {
    index: "01",
    title: "Payback Pulse",
    label: "FEASIBILITY ENGINE",
    description: "Turn a monthly bill into a system-size, savings, and payback estimate you can inspect before an installer call.",
    evidence: "MODEL / ACTIVE",
    href: "/service1",
    icon: Calculator,
  },
  {
    index: "02",
    title: "20-Year Vision",
    label: "INVESTMENT SIMULATOR",
    description: "Stress-test tariffs, degradation, financing, and operating costs across a long-horizon solar asset model.",
    evidence: "ESTIMATE / PARAMETRIC",
    href: "/service2",
    icon: BarChart3,
  },
  {
    index: "03",
    title: "Subsidy Scout",
    label: "POLICY CONTEXT",
    description: "Keep central and state incentive assumptions visible so a subsidy estimate never masquerades as a guarantee.",
    evidence: "POLICY / REVIEW",
    href: "/service3",
    icon: Landmark,
  },
  {
    index: "04",
    title: "Photon Hunter",
    label: "ROOFTOP VISION",
    description: "Explore usable roof area, obstructions, orientation, and panel placement through the computer-vision beta path.",
    evidence: "BETA / IMAGE",
    href: "/service4",
    icon: ScanLine,
  },
  {
    index: "05",
    title: "Grid Guardian",
    label: "MICROGRID LAYER",
    description: "See the experimental optimization surface for generation, storage, grid draw, and tariff-window decisions.",
    evidence: "EXPERIMENTAL / LUMEN",
    href: "/lumen",
    icon: Zap,
  },
]

const FAQS = [
  {
    question: "What does Zenith actually calculate?",
    answer: "The active paths combine structured user inputs with deterministic financial and solar formulas. Results are estimates tied to the values you provide, not a promise of installation performance.",
  },
  {
    question: "Are subsidy values guaranteed?",
    answer: "No. The Subsidy Scout is policy context and eligibility estimation. Confirm the current scheme, state rules, installer paperwork, and approval status before treating any number as committed funding.",
  },
  {
    question: "What is still experimental?",
    answer: "The rooftop vision and Lumen microgrid surfaces are marked beta or experimental. They are useful for exploring the workflow, but they are not a substitute for a physical survey, live telemetry, or an engineering sign-off.",
  },
  {
    question: "Can I start without an account?",
    answer: "The landing surface is open for inspection. Protected analysis routes send you through the explicit demo-access gate and preserve the route you intended to open.",
  },
]

function SectionHeading({ index, eyebrow, title, description }: { index: string; eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="yor-technical text-[var(--yor-warm)]">{index} / {eyebrow}</p>
      <h2 className="yor-display mt-4 text-4xl text-[var(--yor-white)] sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--yor-muted)]">{description}</p>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const navigateProtected = (path: string) => {
    const hasDemoAccess = window.localStorage.getItem("hasDemoAccess") === "true"
    if (hasDemoAccess) {
      router.push(path)
      return
    }
    window.localStorage.setItem("redirectAfterDemoAccess", path)
    router.push("/login")
  }

  return (
    <div className="yor-landing">
      <main className="relative z-10">
        <section id="get-started" className="mx-auto grid w-full max-w-7xl scroll-mt-24 gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[0.92fr,1.08fr] lg:px-10 lg:pb-28 lg:pt-40">
          <div className="flex flex-col justify-center">
            <div className="yor-kicker w-fit"><span className="yor-signal-dot" /> rooftop decision intelligence / India</div>
            <h1 className="yor-display mt-7 max-w-3xl text-[clamp(3.4rem,8vw,7.2rem)] text-[var(--yor-white)]">
              Make the solar decision <em>auditable.</em>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--yor-muted)]">
              Zenith turns a bill, a roof, and a policy context into a decision surface you can question before you commit capital.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigateProtected("/service1")} className="yor-button yor-button--primary">
                Start with a bill <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => router.push("/demo")} className="yor-button yor-button--quiet">
                Inspect the demo <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[var(--yor-muted)]">
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[var(--yor-warm)]" /> transparent assumptions</span>
              <span className="flex items-center gap-2"><FileCheck2 size={14} className="text-[var(--yor-warm)]" /> decision-support output</span>
              <span className="flex items-center gap-2"><Upload size={14} className="text-[var(--yor-warm)]" /> bill or image input</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="flex items-center">
            <div className="yor-console w-full" aria-label="Illustrative Zenith solar decision console">
              <div className="yor-console__bar">
                <div>
                  <p className="yor-technical">signal console / household 0001</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--yor-white)]">Feasibility pass in progress</p>
                </div>
                <span className="yor-state yor-state--hot">DEMO</span>
              </div>
              <div className="yor-console__sun" aria-hidden="true" />
              <div className="absolute right-[15%] top-[10rem] z-[1] text-right">
                <p className="yor-technical text-[var(--yor-warm)]">solar yield trace</p>
                <p className="mt-1 text-sm text-[var(--yor-white)]">7.8 MWh / year</p>
              </div>
              <div className="yor-console__trace" aria-hidden="true" />
              <div className="absolute bottom-[8.5rem] left-[10%] z-[1] max-w-[10rem]">
                <p className="yor-technical">decision flag</p>
                <p className="mt-1 text-sm leading-5 text-[var(--yor-white)]">Payback is a function of the inputs.</p>
              </div>
              <div className="yor-console__readouts">
                <div className="yor-readout"><p className="yor-readout__label">system size</p><p className="yor-readout__value">5.4 kW</p></div>
                <div className="yor-readout"><p className="yor-readout__label">payback estimate</p><p className="yor-readout__value">3.2 yr</p></div>
                <div className="yor-readout"><p className="yor-readout__label">net cost</p><p className="yor-readout__value">₹1.92L</p></div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-3 px-5 pb-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          <div className="yor-readout"><p className="yor-readout__label">input</p><p className="yor-readout__value">bill / roof</p><p className="mt-2 text-xs leading-5 text-[var(--yor-muted)]">Start with what you know.</p></div>
          <div className="yor-readout"><p className="yor-readout__label">model</p><p className="yor-readout__value">ROI + NPV</p><p className="mt-2 text-xs leading-5 text-[var(--yor-muted)]">Surface the math.</p></div>
          <div className="yor-readout"><p className="yor-readout__label">context</p><p className="yor-readout__value">subsidy</p><p className="mt-2 text-xs leading-5 text-[var(--yor-muted)]">Keep policy visible.</p></div>
          <div className="yor-readout"><p className="yor-readout__label">output</p><p className="yor-readout__value">next move</p><p className="mt-2 text-xs leading-5 text-[var(--yor-muted)]">Know what to verify.</p></div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10">
          <SectionHeading index="01" eyebrow="signal modules" title="Five angles. One decision trail." description="Each module has a job. The interface keeps the boundary visible between deterministic calculation, policy context, image analysis, and experimental systems work." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SIGNALS.map((signal, i) => {
              const Icon = signal.icon
              return (
                <motion.article key={signal.index} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.35, delay: i * 0.04 }} className={`yor-panel group flex min-h-[18rem] flex-col p-6 transition-transform duration-200 hover:-translate-y-1 ${i === 0 ? "yor-panel--hot lg:col-span-2" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--yor-warm)]"><Icon size={20} strokeWidth={1.7} /></span>
                    <span className="yor-technical">{signal.index}</span>
                  </div>
                  <p className="yor-technical mt-8 text-[var(--yor-warm)]">{signal.label}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--yor-white)]">{signal.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--yor-muted)]">{signal.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className={`yor-state ${i === 0 ? "yor-state--hot" : ""}`}>{signal.evidence}</span>
                    <button type="button" onClick={() => navigateProtected(signal.href)} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--yor-white)] transition-colors hover:text-[var(--yor-warm)]">Open <ArrowUpRight size={14} /></button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto grid w-full max-w-7xl scroll-mt-24 gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr,1.1fr] lg:px-10">
          <div>
            <SectionHeading index="02" eyebrow="method" title="The model is only useful when the assumptions stay in view." description="Zenith is designed as a guided handoff: every result should lead to a verification step, not a vague sense of certainty." />
            <div className="mt-10 space-y-7">
              {[
                ["01", "Capture the signal", "Enter a monthly bill or start the rooftop path. Missing information stays explicit."],
                ["02", "Run the model", "Calculate capacity, generation, cashflow, payback, NPV, and IRR from structured inputs."],
                ["03", "Add policy context", "Apply a subsidy estimate with the scheme and state caveat attached."],
                ["04", "Choose the next check", "Export or continue only after the output tells you what still needs field or policy verification."],
              ].map(([index, title, body], i) => (
                <div key={index} className={`yor-flow-line ${i === 3 ? "yor-flow-line--muted" : ""}`}>
                  <p className="yor-technical">{index} / workflow step</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--yor-white)]">{title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--yor-muted)]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="yor-panel yor-panel--hot p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="yor-technical">evidence ledger / sample</p><h3 className="mt-2 text-2xl font-semibold text-[var(--yor-white)]">What the output means</h3></div>
              <span className="yor-state yor-state--hot">ESTIMATE</span>
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="yor-table">
                <thead><tr><th>signal</th><th>surface</th><th>boundary</th></tr></thead>
                <tbody>
                  <tr><td>Bill input</td><td className="text-[var(--yor-warm)]">Captured</td><td>user supplied</td></tr>
                  <tr><td>System size</td><td className="text-[var(--yor-warm)]">Calculated</td><td>formula output</td></tr>
                  <tr><td>Subsidy</td><td className="text-[var(--yor-gold)]">Estimated</td><td>policy review</td></tr>
                  <tr><td>Roof layout</td><td className="text-[var(--yor-warm)]">Beta</td><td>image dependent</td></tr>
                  <tr><td>Installer quote</td><td className="text-[var(--yor-muted)]">Pending</td><td>outside system</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="yor-technical">operator note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--yor-muted)]">An estimate is a useful starting point only when a human can see its inputs, limits, and next verification step.</p>
            </div>
          </div>
        </section>

        <section id="intelligence" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10">
          <div className="yor-panel yor-panel--hot grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[0.9fr,1.1fr] lg:p-10">
            <div className="flex flex-col justify-center">
              <p className="yor-technical text-[var(--yor-warm)]">03 / intelligence layer</p>
              <h2 className="yor-display mt-4 text-4xl text-[var(--yor-white)] sm:text-5xl">See the long game before it owns the conversation.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--yor-muted)]">The projection surface makes the trade-offs legible: upfront cost, clean generation, grid draw, and the moment the model crosses into positive return.</p>
              <button type="button" onClick={() => navigateProtected("/service2")} className="yor-button yor-button--primary mt-8 w-fit">Open investment simulator <ArrowRight size={16} /></button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/35 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4"><div><p className="yor-technical">projection / illustrative</p><p className="mt-1 text-sm font-semibold text-[var(--yor-white)]">Cumulative cashflow</p></div><span className="yor-state">DEMO DATA</span></div>
              <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-white/10 px-2 pb-0">
                {[18, 24, 31, 39, 44, 52, 60, 69, 79, 90, 98, 112].map((height, i) => <div key={i} className={`flex-1 rounded-t-sm ${i < 3 ? "bg-[rgba(196,196,196,0.28)]" : "bg-[var(--yor-crimson)]"}`} style={{ height: `${height}px` }} />)}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div><p className="yor-readout__label">payback</p><p className="mt-1 text-lg font-semibold text-[var(--yor-white)]">3.2 yr</p></div>
                <div><p className="yor-readout__label">net value</p><p className="mt-1 text-lg font-semibold text-[var(--yor-white)]">₹15.4L</p></div>
                <div><p className="yor-readout__label">confidence</p><p className="mt-1 text-lg font-semibold text-[var(--yor-warm)]">input-led</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10">
          <SectionHeading index="04" eyebrow="access paths" title="Start with the decision you need to make." description="The public path is for inspection. The protected paths keep the analysis workflow and route context together." />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="yor-panel p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4"><span className="yor-state">HOMEOWNER</span><CircleDollarSign size={22} className="text-[var(--yor-warm)]" /></div>
              <h3 className="mt-8 text-3xl font-semibold text-[var(--yor-white)]">Planning toolkit</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--yor-muted)]">Build a transparent first pass around bill, roof, subsidy, and long-term return assumptions before talking to an installer.</p>
              <ul className="mt-7 grid gap-3 text-sm text-[var(--yor-muted)]"><li>• feasibility score and payback</li><li>• subsidy eligibility estimate</li><li>• long-horizon savings model</li><li>• basic rooftop capacity path</li></ul>
              <button type="button" onClick={() => navigateProtected("/service1")} className="yor-button yor-button--primary mt-8">Analyze my roof <ArrowRight size={16} /></button>
            </div>
            <div className="yor-panel yor-panel--hot p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4"><span className="yor-state yor-state--hot">EPC / PRO</span><Activity size={22} className="text-[var(--yor-warm)]" /></div>
              <h3 className="mt-8 text-3xl font-semibold text-[var(--yor-white)]">Installer intelligence</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--yor-muted)]">Carry a client-ready model into the next conversation with IRR, NPV, cashflow, layout, and policy assumptions in one place.</p>
              <ul className="mt-7 grid gap-3 text-sm text-[var(--yor-muted)]"><li>• proposal-ready decision output</li><li>• financing and tariff scenarios</li><li>• system configuration context</li><li>• repeatable customer workflow</li></ul>
              <button type="button" onClick={() => navigateProtected("/service2")} className="yor-button yor-button--quiet mt-8">Open the long view <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-4xl scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="text-center"><p className="yor-technical text-[var(--yor-warm)]">05 / boundary notes</p><h2 className="yor-display mt-4 text-4xl text-[var(--yor-white)] sm:text-5xl">Good decisions leave a paper trail.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--yor-muted)]">A few direct answers about what the platform does, what it estimates, and what still belongs in the real world.</p></div>
          <div className="mt-10 grid gap-3">
            {FAQS.map((faq, index) => {
              const open = activeFaq === index
              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <button type="button" onClick={() => setActiveFaq(open ? null : index)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-semibold text-[var(--yor-white)] hover:bg-white/[0.04]">
                    {faq.question}<ChevronDown size={18} className={`shrink-0 text-[var(--yor-warm)] transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 text-sm leading-6 text-[var(--yor-muted)]">{faq.answer}</motion.div>}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="yor-footer relative z-10 px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="yor-technical text-[var(--yor-warm)]">ZENITH // YOR VISUAL SYSTEM</p><p className="mt-3 max-w-md text-sm leading-6 text-[var(--yor-muted)]">India-focused solar decision intelligence. Deterministic calculations, visible assumptions, and clearly marked experimental surfaces.</p></div>
          <div className="flex flex-col items-start gap-2 text-xs text-[var(--yor-muted)] sm:items-end"><a href="https://github.com/yorayriniwnl/Yor-Zenith" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--yor-white)]">source repository <ArrowUpRight size={13} /></a><span>© {new Date().getFullYear()} Zenith / Bhubaneswar, India</span></div>
        </div>
      </footer>
    </div>
  )
}