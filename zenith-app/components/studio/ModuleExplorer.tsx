"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Activity,
  BarChart3,
  Landmark,
  ScanLine,
  Zap,
} from "lucide-react";
import { workspaceEntryHref } from "@/lib/workspaceNavigation";

const modules = [
  {
    key: "feasibility",
    icon: Activity,
    label: "Feasibility",
    title: "Start with the roof.\nSee the bigger picture.",
    description:
      "Turn an electricity bill into a starting model for system size, generation, cost and payback. Keep the inputs in view, so every result has a reason.",
    href: "/service1",
    cta: "Build your first model",
    input: "Your bill + tariff + location",
    output: "A saved feasibility snapshot",
    note: "A planning signal, not an engineering sign-off.",
    tags: ["System sizing", "Generation", "Cost & payback"],
  },
  {
    key: "investment",
    icon: BarChart3,
    label: "Investment",
    title: "A payback number\nis only the beginning.",
    description:
      "Explore the 25-year outlook. Change costs, tariff growth and maintenance assumptions to understand what moves the investment case.",
    href: "/service2",
    cta: "Explore the investment model",
    input: "System cost + operating assumptions",
    output: "Cash flow, NPV and sensitivity",
    note: "Modeled returns are not guaranteed investment outcomes.",
    tags: ["25-year outlook", "Cash flow", "Sensitivity"],
  },
  {
    key: "policy",
    icon: Landmark,
    label: "Policy",
    title: "Know the estimate.\nCheck the eligibility.",
    description:
      "See configured central subsidy assumptions alongside the checks still needed. Separate a modeled incentive from an approved application.",
    href: "/service3",
    cta: "Review policy assumptions",
    input: "System size + eligibility details",
    output: "A reviewable policy estimate",
    note: "Confirm current rules with MNRE and your DISCOM.",
    tags: ["Central scheme", "Eligibility", "Verification"],
  },
  {
    key: "rooftop",
    icon: ScanLine,
    label: "Rooftop",
    title: "A first look, before\nthe first site visit.",
    description:
      "Use rooftop imagery for a preliminary visual screen. Prepare better questions about orientation, obstructions and usable space for your installer.",
    href: "/service4",
    cta: "Start a rooftop study",
    input: "A rooftop video or visual input",
    output: "A preliminary site brief",
    note: "Structural, shading and electrical reviews remain essential.",
    tags: ["Visual study", "Roof context", "Installer brief"],
  },
  {
    key: "energy",
    icon: Zap,
    label: "Energy",
    title: "Follow the energy.\nQuestion the scenario.",
    description:
      "Explore how solar, storage and grid demand interact. Change the scenario to make the trade-offs easier to see, without pretending this is live telemetry.",
    href: "/service5",
    cta: "Explore energy scenarios",
    input: "Solar + battery + demand assumptions",
    output: "A simulated energy-flow plan",
    note: "Simulation only. No connected devices or live control.",
    tags: ["Solar & storage", "Grid draw", "Simulation"],
  },
];

export default function ModuleExplorer() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeModule = modules[active];
  const Icon = activeModule.icon;

  const handleKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % modules.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + modules.length) % modules.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = modules.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="module-explorer">
      <div
        role="tablist"
        aria-label="Explore Zenith tools"
        className="module-tabs"
      >
        {modules.map((item, index) => (
          <button
            key={item.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={`module-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`module-panel-${item.key}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            <span>0{index + 1}</span>
            {item.label}
            <item.icon size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
      {modules.map((item, index) => (
        <div
          key={item.key}
          id={`module-panel-${item.key}`}
          role="tabpanel"
          aria-labelledby={`module-tab-${item.key}`}
          hidden={active !== index}
          tabIndex={0}
        >
          {active === index && (
            <div className="module-panel">
              <div className="module-copy">
                <span className="studio-eyebrow">
                  THE {activeModule.label.toUpperCase()} LAYER
                </span>
                <h3>{activeModule.title}</h3>
                <p>{activeModule.description}</p>
                <Link
                  href={workspaceEntryHref(activeModule.href)}
                  className="studio-text-link"
                >
                  {activeModule.cta}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="module-flow">
                <div className="module-flow-top">
                  <span>THE DECISION PATH</span>
                  <Icon size={19} aria-hidden="true" />
                </div>
                <div className="module-flow-row">
                  <span className="flow-node">01</span>
                  <div>
                    <small>BRING YOUR INPUTS</small>
                    <p>{activeModule.input}</p>
                  </div>
                </div>
                <div className="module-connector" aria-hidden="true" />
                <div className="module-flow-row">
                  <span className="flow-node flow-node-filled">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <small>EXPLORE THE MODEL</small>
                    <div className="module-tags">
                      {activeModule.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="module-connector" aria-hidden="true" />
                <div className="module-flow-row">
                  <span className="flow-node">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <small>TAKE THE NEXT STEP</small>
                    <p>{activeModule.output}</p>
                  </div>
                </div>
                <p className="module-flow-note">{activeModule.note}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
