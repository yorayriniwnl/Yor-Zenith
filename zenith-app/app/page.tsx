import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  LockKeyhole,
  Plus,
  Sun,
  Target,
} from "lucide-react";
import SolarPreview from "@/components/studio/SolarPreview";
import ModuleExplorer from "@/components/studio/ModuleExplorer";
import { workspaceEntryHref } from "@/lib/workspaceNavigation";

const workflow = [
  {
    number: "01",
    title: "Bring a bill.",
    description:
      "Start with your location, electricity spend and tariff. No perfect dataset required.",
  },
  {
    number: "02",
    title: "Explore the upside.",
    description:
      "Build a baseline, then see how costs and assumptions change the long-term outlook.",
  },
  {
    number: "03",
    title: "Check the details.",
    description:
      "Review policy eligibility and roof context. Keep the unanswered questions visible.",
  },
  {
    number: "04",
    title: "Move with clarity.",
    description:
      "Take a structured feasibility brief to a qualified installer for the final site review.",
  },
];

const faqs = [
  {
    question: "Can I use Zenith before talking to an installer?",
    answer:
      "Yes. Zenith is a planning workspace for understanding the questions to ask before committing. You can explore the sample without an account. The full workspace currently requires an invitation from the administrator.",
  },
  {
    question: "Are these estimates guaranteed?",
    answer:
      "No. Results depend on the inputs and assumptions shown in each model. Actual generation, tariff savings, installation costs and payback can differ. A qualified professional must confirm structural safety, shading, electrical design and the final system.",
  },
  {
    question: "How are subsidies handled?",
    answer:
      "The policy tool uses configured central scheme assumptions to produce an estimate, not an approval. Verify current amounts and eligibility with MNRE, your DISCOM and your installer before relying on an incentive.",
  },
  {
    question: "Where are my project snapshots saved?",
    answer:
      "Project snapshots stay in the browser on this device. The workspace lets you download a JSON backup, restore a backup or remove snapshots. This is not cloud sync. AI-assisted tools send submitted inputs to the configured AI service; read the privacy notice before uploading personal information.",
  },
  {
    question: "Is there a paid plan?",
    answer:
      "The current workspace is a private beta. An installer plan is proposed, but checkout and paid entitlements are not active. No payment or subscription is created by exploring the product.",
  },
];

export default function WelcomePage() {
  return (
    <div className="studio landing-studio">
      <main id="main-content">
        <section
          className="studio-container landing-hero"
          id="get-started"
          aria-labelledby="hero-heading"
        >
          <div className="hero-copy studio-enter">
            <div className="hero-kicker">
              <span className="studio-eyebrow">THE SOLAR DECISION STUDIO</span>
              <span className="hero-beta">PRIVATE BETA</span>
            </div>
            <h1 id="hero-heading">
              Your roof.
              <br />
              Your power.
              <br />
              <span>Your move.</span>
            </h1>
            <p className="hero-description">
              There is a bigger story above your head. See what rooftop solar
              could mean for your home, your bills, and your next 25 years.
            </p>
            <div className="hero-actions">
              <Link
                href={workspaceEntryHref("/service1")}
                className="studio-button studio-button-primary"
              >
                Find your solar potential
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <a href="#features" className="hero-secondary">
                Explore the studio
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="hero-footnote-icon">
                <Target size={18} aria-hidden="true" />
              </span>
              <p>
                Built for decisions. Grounded in assumptions.
                <br />
                <span>No promises of guaranteed savings.</span>
              </p>
            </div>
          </div>
          <div className="hero-study studio-enter">
            <SolarPreview />
          </div>
        </section>

        <div className="studio-container">
          <div className="studio-proof-strip">
            <p>
              A little more certainty.
              <br />
              <strong>A much clearer next step.</strong>
            </p>
            <div>
              <strong>05</strong>
              <span>
                Connected
                <br />
                decision tools
              </span>
            </div>
            <div>
              <strong>
                25<span>yr</span>
              </strong>
              <span>
                Financial model
                <br />
                horizon
              </span>
            </div>
            <div>
              <Sun size={30} strokeWidth={1.3} aria-hidden="true" />
              <span>
                Designed around
                <br />
                Indian rooftops
              </span>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="studio-container studio-section"
          aria-labelledby="features-heading"
        >
          <div className="studio-section-heading">
            <div>
              <p className="studio-eyebrow">ONE STUDIO. FIVE PERSPECTIVES.</p>
              <h2 id="features-heading">
                Connect the dots.
                <br />
                <span>Then make your move.</span>
              </h2>
            </div>
            <p>
              You do not need another isolated number.
              <br />
              You need to know how it all fits together.
            </p>
          </div>
          <div id="intelligence">
            <ModuleExplorer />
          </div>
        </section>

        <section
          className="workflow-section"
          id="how-it-works"
          aria-labelledby="workflow-heading"
        >
          <div className="studio-container">
            <div className="studio-section-heading">
              <div>
                <p className="studio-eyebrow">
                  FROM CURIOSITY TO A CLEARER PLAN
                </p>
                <h2 id="workflow-heading">
                  Big decision.
                  <br />
                  Considered steps.
                </h2>
              </div>
              <p>
                Start small. Build context.
                <br />
                Know what needs checking before you commit.
              </p>
            </div>
            <ol className="workflow-grid">
              {workflow.map((step) => (
                <li key={step.number}>
                  <div className="workflow-step-line">
                    <span>{step.number}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <div className="workflow-footer">
              <span>
                <FileText size={17} aria-hidden="true" />A useful brief for the
                installer conversation.
              </span>
              <Link href="/watch-demo">
                Watch the walkthrough
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="studio-container studio-section trust-section"
          id="testimonials"
          aria-labelledby="trust-heading"
        >
          <div className="trust-intro">
            <span className="studio-eyebrow">
              CONFIDENCE WITHOUT THE FINE-PRINT TRAP
            </span>
            <h2 id="trust-heading">
              A better decision
              <br />
              starts with
              <br />
              <span>an honest model.</span>
            </h2>
            <p>
              Clarity is not just a clean screen. It is knowing what went into a
              result, what can change, and what still needs a human check.
            </p>
            <Link href="/disclaimer" className="studio-text-link">
              Understand the model limits
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="trust-principles">
            {[
              [
                "01",
                "Inputs, not a black box.",
                "Your bill, tariff and operating assumptions remain part of the conversation. Change them when your evidence changes.",
              ],
              [
                "02",
                "An estimate is an estimate.",
                "Policy outputs are not approvals. Financial projections are not guarantees. Simulations are not live energy telemetry.",
              ],
              [
                "03",
                "A professional still matters.",
                "Use Zenith to prepare for a structural, electrical and shading review, not to replace one.",
              ],
            ].map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Plus size={17} aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section
          className="studio-container studio-section access-section"
          id="pricing"
          aria-labelledby="access-heading"
        >
          <div className="studio-section-heading">
            <div>
              <p className="studio-eyebrow">A SPACE FOR YOUR NEXT PROJECT</p>
              <h2 id="access-heading">
                Start with possibility.
                <br />
                <span>Scale with purpose.</span>
              </h2>
            </div>
            <p>
              Explore the sample now.
              <br />
              Full workspace access is currently invite-only.
            </p>
          </div>
          <div className="access-grid">
            <article className="access-card">
              <div className="access-card-top">
                <span>FOR HOMEOWNERS</span>
                <Sun size={22} aria-hidden="true" />
              </div>
              <h3>Your first solar decision.</h3>
              <p className="access-description">
                A more informed starting point before you speak to an installer.
              </p>
              <p className="access-price">
                Free<span>during private beta</span>
              </p>
              <ul>
                {[
                  "Bill-based feasibility and sizing",
                  "Financial and policy planning tools",
                  "Local project snapshots and backup",
                ].map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={workspaceEntryHref("/service1")}
                className="studio-button studio-button-outline"
              >
                Enter the workspace
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <p className="access-note">
                <LockKeyhole size={12} aria-hidden="true" />
                An administrator invitation is required.
              </p>
            </article>
            <article className="access-card access-card-featured">
              <div className="access-card-top">
                <span>FOR INSTALLERS & EPC TEAMS</span>
                <span className="access-preview-label">PLANNED OFFERING</span>
              </div>
              <h3>A sharper client conversation.</h3>
              <p className="access-description">
                Explore the modeling tools that could support your proposal
                workflow.
              </p>
              <p className="access-price">
                ₹2,499<span>/ month, proposed</span>
              </p>
              <ul>
                {[
                  "25-year cash flow and sensitivity",
                  "Structured feasibility report exports",
                  "Preliminary rooftop and energy studies",
                ].map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={workspaceEntryHref("/service2")}
                className="studio-button studio-button-primary"
              >
                Explore the planning tools
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <p className="access-note">
                Preview only. Billing and paid entitlements are not active.
              </p>
            </article>
          </div>
        </section>

        <section
          className="studio-container studio-section faq-section"
          id="faq"
          aria-labelledby="faq-heading"
        >
          <div>
            <p className="studio-eyebrow">BEFORE YOU BEGIN</p>
            <h2 id="faq-heading">
              Good questions.
              <br />
              <span>Clear answers.</span>
            </h2>
          </div>
          <div className="studio-faqs">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <Plus size={17} aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="studio-container landing-closing"
          aria-labelledby="closing-heading"
        >
          <div className="closing-sun" aria-hidden="true">
            <Sun size={160} strokeWidth={0.7} />
          </div>
          <p className="studio-eyebrow">THE NEXT CHAPTER IS ABOVE YOU</p>
          <h2 id="closing-heading">
            Make room
            <br />
            for a brighter idea.
          </h2>
          <Link
            href={workspaceEntryHref("/service1")}
            className="studio-button studio-button-primary"
          >
            Explore your roof&apos;s potential
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
          <p>One bill. A clearer perspective. Your next move.</p>
        </section>
      </main>

      <footer className="studio-footer studio-container">
        <div className="footer-top">
          <Link href="/" className="studio-brand" aria-label="Zenith home">
            <span className="brand-symbol">
              <Sun size={24} aria-hidden="true" />
            </span>
            zenith<span className="brand-period">.</span>
          </Link>
          <p>
            A considered approach to solar.
            <br />
            Built in Bhubaneswar, India.
          </p>
          <nav aria-label="Footer">
            <a href="#features">The studio</a>
            <a href="#faq">Questions</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Model limits</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Zenith. All rights reserved.</span>
          <span>
            Private beta. Legal documents require owner review before launch.
          </span>
        </div>
      </footer>
    </div>
  );
}
