import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

export default function LegalDocument({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main id="main-content" className="min-h-screen bg-[#050808] px-4 py-32 text-white sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300/80">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-7 text-amber-100">
          Draft for the Zenith private beta. Owner and legal review are required before commercial launch.
        </p>
        <p className="mt-6 text-base leading-8 text-white/65">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-white/60">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/45">
          <Link href="/" className="font-semibold text-emerald-200 hover:text-emerald-100">Return to Zenith</Link>
        </div>
      </article>
    </main>
  );
}
