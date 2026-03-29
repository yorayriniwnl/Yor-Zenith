import Link from "next/link";
import { Play } from "lucide-react";

const VIDEO_ID = "SilV4Ox3Lm0";
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`;
const YOUTUBE_WATCH_URL = `https://youtu.be/${VIDEO_ID}`;

const HIGHLIGHTS = [
  {
    label: "Demo Focus",
    value: "Product Walkthrough",
    desc: "End-to-end flow from analysis input to feasibility decisions.",
  },
  {
    label: "Playback",
    value: "Responsive 16:9 Player",
    desc: "Optimized for desktop, tablet, and mobile viewing.",
  },
  {
    label: "Visual Tone",
    value: "Home-Style Interface",
    desc: "Green-cyan highlights with the same Zenith UI rhythm.",
  },
];

export default function WatchDemoPage() {
  return (
    <div className="min-h-screen bg-[#06090f] text-gray-50 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <main className="relative z-10 w-full max-w-[84rem] mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-16">
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Zenith Demo Experience
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[5rem] font-extrabold leading-[1.02] mb-5 tracking-tighter">
            Watch Zenith, <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
              In Action.
            </span>
          </h1>

          <p className="text-[1.05rem] text-gray-400 max-w-[44rem] mx-auto leading-relaxed font-light">
            A clean walkthrough of the platform flow, from user input to the
            final decision insights your customers care about.
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-emerald-500/30 bg-[#05080d]/90 overflow-hidden shadow-[0_22px_48px_rgba(0,0,0,0.45)] mb-6">
          <div className="px-4 md:px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] tracking-[0.28em] uppercase text-emerald-400 font-bold">
              Live Demo Feed
            </div>

            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] tracking-[0.18em] uppercase text-white border border-white/20 rounded-full px-4 py-2 bg-white/5 hover:bg-white/10 transition"
            >
              Open on YouTube
            </a>
          </div>

          <div className="relative aspect-video bg-black">
            <iframe
              src={EMBED_URL}
              title="Zenith Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.label}
              className="border border-white/10 rounded-2xl p-4 bg-[#0b111a]/75 hover:border-emerald-400/40 transition"
            >
              <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">
                {item.label}
              </div>
              <div className="text-[15px] font-extrabold tracking-wide uppercase text-white mb-2">
                {item.value}
              </div>
              <p className="text-[12px] leading-7 text-gray-400 m-0">{item.desc}</p>
            </article>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          <Link
            href="/engine"
            className="w-full sm:w-auto bg-white/5 border border-white/10 px-6 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all"
          >
            Back to Engine
          </Link>

          <a
            href={YOUTUBE_WATCH_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-500 text-black hover:bg-emerald-400 px-6 py-3.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.06)] inline-flex items-center justify-center gap-2"
          >
            <Play size={18} className="fill-black" /> Watch on YouTube
          </a>
        </div>
      </main>
    </div>
  );
}
