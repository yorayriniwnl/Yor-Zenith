import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06090f] px-6 py-24 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <Compass size={25} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/75">404 · Route not found</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">That page is not part of this workspace.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55">The link may be outdated, or the project workflow may have moved. Start again from the decision workspace.</p>
        <Link href="/" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"><ArrowLeft size={16} aria-hidden="true" />Return home</Link>
      </section>
    </main>
  );
}
