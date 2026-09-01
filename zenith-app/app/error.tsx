"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06090f] px-6 py-24 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-amber-300/15 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
          <AlertTriangle size={25} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-amber-200/75">Temporary interruption</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">This workspace needs a refresh.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55">The page could not finish loading. Your saved browser data is unchanged, so try again or return to the workspace overview.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"><RotateCcw size={16} aria-hidden="true" />Try again</button>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><ArrowLeft size={16} aria-hidden="true" />Workspace overview</Link>
        </div>
      </section>
    </main>
  );
}
