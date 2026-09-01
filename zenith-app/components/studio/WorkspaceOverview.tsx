"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FileUp,
  FolderOpen,
  HardDrive,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import {
  clearZenithProjects,
  createZenithProjectsBackup,
  readZenithProjects,
  restoreZenithProjectsBackup,
  ZENITH_PROJECTS_CHANGED_EVENT,
  ZENITH_PROJECTS_STORAGE_KEY,
  type ZenithProject,
} from "@/lib/zenithProjects";
import SolarRoof from "./SolarRoof";

function subscribeProjects(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ZENITH_PROJECTS_STORAGE_KEY || event.key === null)
      callback();
  };
  window.addEventListener(ZENITH_PROJECTS_CHANGED_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ZENITH_PROJECTS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function projectSnapshot() {
  try {
    return window.localStorage.getItem(ZENITH_PROJECTS_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

const emptyServerSnapshot = () => null;
const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
const updatedDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const projectHref = (project: ZenithProject) =>
  `/service1?project=${encodeURIComponent(project.id)}`;
type Notice = { kind: "success" | "error"; message: string };

export default function WorkspaceOverview() {
  const snapshot = useSyncExternalStore<string | null>(
    subscribeProjects,
    projectSnapshot,
    emptyServerSnapshot,
  );
  const projects = useMemo(
    () => (snapshot === null ? [] : readZenithProjects()),
    [snapshot],
  );
  const [activeId, setActiveId] = useState<string>();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [notice, setNotice] = useState<Notice>();
  const [isRestoring, setIsRestoring] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const clearTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelClearRef = useRef<HTMLButtonElement>(null);
  const activeProject =
    projects.find((project) => project.id === activeId) ?? projects[0];
  const investmentHref = activeProject
    ? `/service2?kw=${activeProject.systemSizeKW}&tariff=${activeProject.tariffPerKWh}&sun=4.5&bill=${activeProject.monthlyBill}&location=${encodeURIComponent(activeProject.location)}`
    : "/service2";
  const visibleProjects = projects
    .filter((project) =>
      `${project.name} ${project.location}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "payback"
        ? (a.paybackYears ?? Infinity) - (b.paybackYears ?? Infinity)
        : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );

  const handleExport = () => {
    try {
      const url = URL.createObjectURL(
        new Blob([createZenithProjectsBackup()], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `zenith-snapshots-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({
        kind: "success",
        message:
          "Backup download started. Keep it somewhere safe before changing devices.",
      });
    } catch {
      setNotice({
        kind: "error",
        message: "The backup could not be downloaded. Please try again.",
      });
    }
  };

  const handleRestore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsRestoring(true);
    setNotice(undefined);
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("Choose a JSON backup smaller than 2 MB.");
      const result = restoreZenithProjectsBackup(
        JSON.parse(await file.text()) as unknown,
      );
      setNotice({
        kind: "success",
        message:
          result.imported === 0
            ? "Your existing snapshots were kept. No newer copies could be added because the entries were older, duplicates, or the library was full."
            : `${result.imported} snapshot${result.imported === 1 ? "" : "s"} restored.${result.skipped ? ` ${result.skipped} older, duplicate, invalid or over-capacity entries were skipped.` : ""}`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The backup could not be restored.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const confirmClear = () => {
    const cleared = clearZenithProjects();
    clearDialogRef.current?.close();
    if (cleared) {
      setActiveId(undefined);
      setQuery("");
    }
    setNotice({
      kind: cleared ? "success" : "error",
      message: cleared
        ? "Project snapshots were removed from this browser. Downloaded backups and other tool drafts are unchanged."
        : "The browser could not remove the snapshots. Please try again.",
    });
  };

  if (snapshot === null)
    return (
      <div className="workspace-initial-loading" role="status">
        <span className="studio-eyebrow">YOUR DECISION STUDIO</span>
        <div />
        <p>Loading snapshots from this device...</p>
      </div>
    );

  return (
    <div className="studio workspace-overview">
      <div className="workspace-page-heading">
        <div>
          <p className="studio-eyebrow">YOUR DECISION STUDIO</p>
          <h1>A clearer view of what&apos;s next.</h1>
          <p>
            {activeProject
              ? "Your projects, assumptions and next moves, together."
              : "Every considered decision begins with a little context."}
          </p>
        </div>
        <Link
          href="/service1?new=1"
          className="studio-button studio-button-primary"
        >
          <Plus size={17} aria-hidden="true" />
          New project
        </Link>
      </div>

      <div className="workspace-top-grid">
        <section
          className="project-stage"
          aria-labelledby="project-stage-heading"
        >
          <div className="project-stage-main">
            <div className="project-stage-copy">
              <p className="studio-eyebrow">
                {activeProject ? "PROJECT IN FOCUS" : "YOUR FIRST CHAPTER"}
              </p>
              <h2 id="project-stage-heading">
                {activeProject?.name ?? "A roof full of possibilities."}
              </h2>
              {activeProject ? (
                <p className="stage-location">
                  <MapPin size={14} aria-hidden="true" />
                  {activeProject.location}
                </p>
              ) : (
                <p>
                  Bring a recent electricity bill.
                  <br />
                  We will help you see the bigger picture.
                </p>
              )}
              <Link
                className="studio-text-link"
                href={
                  activeProject ? projectHref(activeProject) : "/service1?new=1"
                }
              >
                {activeProject
                  ? "Review feasibility snapshot"
                  : "Build your first model"}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <figure className="project-stage-art">
              <SolarRoof
                dark
                panels={
                  activeProject
                    ? Math.ceil(activeProject.systemSizeKW / 0.55)
                    : 12
                }
              />
              <figcaption>CONCEPTUAL ROOF STUDY</figcaption>
            </figure>
          </div>
          {activeProject ? (
            <dl className="project-stage-metrics">
              <div>
                <dt>System size</dt>
                <dd>
                  {activeProject.systemSizeKW.toFixed(1)}
                  <span> kW</span>
                </dd>
              </div>
              <div>
                <dt>Modeled payback</dt>
                <dd
                  className={
                    activeProject.paybackYears === null
                      ? "metric-not-recoverable"
                      : ""
                  }
                >
                  {activeProject.paybackYears === null ? (
                    "Not recoverable"
                  ) : (
                    <>
                      {activeProject.paybackYears.toFixed(1)}
                      <span> yrs</span>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>Feasibility signal</dt>
                <dd>
                  {activeProject.feasibilityScore.toFixed(1)}
                  <span> / 10</span>
                </dd>
              </div>
            </dl>
          ) : (
            <div className="stage-empty-note">
              <span>
                <ShieldCheck size={15} aria-hidden="true" />
                Your inputs stay visible.
              </span>
              <span>No result until you run a model.</span>
            </div>
          )}
        </section>
        <aside className="next-step-card" aria-labelledby="next-step-heading">
          <div className="next-step-kicker">
            <span>THE NEXT GOOD MOVE</span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </div>
          <h2 id="next-step-heading">
            {activeProject
              ? "Look beyond the payback."
              : "Start with what you know."}
          </h2>
          <p>
            {activeProject
              ? "Test the costs, tariff growth and maintenance behind your 25-year investment case."
              : "You do not need a technical survey to start exploring. Have these three things ready."}
          </p>
          <ul>
            {(activeProject
              ? [
                  "Check the installation cost",
                  "Stress-test operating assumptions",
                  "Review the long-term cash flow",
                ]
              : [
                  "A recent electricity bill",
                  "Your effective tariff per kWh",
                  "The city or state of your site",
                ]
            ).map((item, index) => (
              <li key={item}>
                <span>0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
          <Link href={activeProject ? investmentHref : "/service1?new=1"}>
            {activeProject
              ? "Open investment model"
              : "Start feasibility check"}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </div>

      <section
        className="decision-path"
        aria-labelledby="decision-path-heading"
      >
        <div className="workspace-section-label">
          <h2 id="decision-path-heading">Your decision path</h2>
          <span>
            {activeProject
              ? "Feasibility snapshot saved"
              : "Start at your own pace"}
          </span>
        </div>
        <ol>
          {[
            {
              title: "Feasibility",
              detail: activeProject ? "Snapshot saved" : "Build a baseline",
              href: activeProject
                ? projectHref(activeProject)
                : "/service1?new=1",
            },
            {
              title: "Investment",
              detail: "Explore the economics",
              href: investmentHref,
            },
            {
              title: "Policy",
              detail: "Verify the assumptions",
              href: "/service3",
            },
            {
              title: "Rooftop",
              detail: "Prepare the site review",
              href: "/service4",
            },
          ].map((step, index) => (
            <li key={step.title}>
              <Link
                href={step.href}
                className={index === 0 ? "path-current" : ""}
              >
                <span className="path-number">
                  {index === 0 && activeProject ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
        <p className="path-note">
          A guide, not a completion tracker. Later reviews are not yet tracked
          automatically.
        </p>
      </section>

      <section className="project-library" aria-labelledby="library-heading">
        <div className="workspace-section-label">
          <div>
            <p className="studio-eyebrow">YOUR PROJECT LIBRARY</p>
            <h2 id="library-heading">
              Saved perspectives
              <span className="project-count">{projects.length}</span>
            </h2>
          </div>
          <span>
            <HardDrive size={13} aria-hidden="true" />
            On this device
          </span>
        </div>
        {projects.length > 0 ? (
          <>
            <div className="project-library-controls">
              <div className="project-search">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search saved projects"
                  placeholder="Find a project or location..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <label className="project-sort">
                <SlidersHorizontal size={15} aria-hidden="true" />
                <span className="sr-only">Sort saved projects</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="recent">Most recent</option>
                  <option value="payback">Lowest payback</option>
                </select>
                <ChevronDown size={13} aria-hidden="true" />
              </label>
            </div>
            <div className="project-list">
              {visibleProjects.length ? (
                visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className={`project-row ${activeProject?.id === project.id ? "project-row-active" : ""}`}
                  >
                    <span className="project-row-icon">
                      <FolderOpen size={19} aria-hidden="true" />
                    </span>
                    <div className="project-row-name">
                      <h3>{project.name}</h3>
                      <p>
                        {project.location} · {updatedDate(project.updatedAt)}
                      </p>
                    </div>
                    <div className="project-row-payback">
                      <span>MODELED PAYBACK</span>
                      <strong>
                        {project.paybackYears === null
                          ? "Not recoverable"
                          : `${project.paybackYears.toFixed(1)} yrs`}
                      </strong>
                    </div>
                    <button
                      type="button"
                      aria-pressed={activeProject?.id === project.id}
                      onClick={() => setActiveId(project.id)}
                      className="project-focus-button"
                      aria-label={`Focus ${project.name}`}
                    >
                      {activeProject?.id === project.id ? "In focus" : "Focus"}
                    </button>
                    <Link
                      href={projectHref(project)}
                      className="project-open"
                      aria-label={`Open ${project.name}`}
                    >
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </Link>
                  </article>
                ))
              ) : (
                <div className="library-no-results">
                  <Search size={24} aria-hidden="true" />
                  <p>No projects match &ldquo;{query}&rdquo;.</p>
                  <button type="button" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
            </div>
            <p className="project-library-note">
              {visibleProjects.length} of {projects.length} snapshots · Up to 12
              snapshots are kept locally.
            </p>
          </>
        ) : (
          <div className="library-empty">
            <span>
              <FolderOpen size={24} aria-hidden="true" />
            </span>
            <div>
              <h3>A home for your next idea.</h3>
              <p>
                Finish a feasibility check to save your first project here.
                Returning to it should be the easy part.
              </p>
            </div>
            <Link href="/service1?new=1">
              Create a project
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      {activeProject && (
        <div className="workspace-context-strip">
          <span>IN FOCUS</span>
          <p>{activeProject.name}</p>
          <span>
            Monthly bill <strong>{currency(activeProject.monthlyBill)}</strong>
          </span>
          <span>
            Tariff <strong>₹{activeProject.tariffPerKWh.toFixed(2)}/kWh</strong>
          </span>
        </div>
      )}

      <details className="workspace-data-controls">
        <summary>
          <span>
            <HardDrive size={17} aria-hidden="true" />
            <strong>Your data, on your device.</strong>
            <small>Backup, restore and remove snapshots</small>
          </span>
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <div className="workspace-data-content">
          <p>
            Snapshots are browser-local, not cloud-synced. Download a backup
            before switching devices. Restoring keeps the newer version of each
            project and adds new snapshots only where space remains in the
            12-snapshot library. Existing projects are not evicted by a restore.
            Clearing removes project snapshots only; other tool drafts and
            downloaded reports remain.
          </p>
          <div className="data-control-actions">
            <button
              type="button"
              onClick={handleExport}
              disabled={!projects.length || isRestoring}
            >
              <Download size={15} aria-hidden="true" />
              Download backup
            </button>
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              disabled={isRestoring}
            >
              <FileUp size={15} aria-hidden="true" />
              {isRestoring ? "Restoring..." : "Restore backup"}
            </button>
            <button
              type="button"
              ref={clearTriggerRef}
              onClick={() => {
                clearDialogRef.current?.showModal();
                cancelClearRef.current?.focus();
              }}
              disabled={!projects.length || isRestoring}
              className="data-clear-button"
            >
              <Trash2 size={15} aria-hidden="true" />
              Clear snapshots
            </button>
          </div>
          <input
            ref={backupInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleRestore(event)}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a Zenith snapshot backup file"
          />
        </div>
      </details>
      {notice && (
        <p
          className={`workspace-notice workspace-notice-${notice.kind}`}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          {notice.message}
        </p>
      )}

      <div className="workspace-bottom-note">
        <span>
          <ShieldCheck size={15} aria-hidden="true" />
          Models inform decisions. A qualified site review confirms them.
        </span>
        <Link href="/disclaimer">
          <CircleHelp size={14} aria-hidden="true" />
          Model limits
        </Link>
      </div>

      <dialog
        ref={clearDialogRef}
        className="confirmation-dialog studio"
        aria-labelledby="clear-title"
        aria-describedby="clear-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clearDialogRef.current?.close();
          }
        }}
        onClose={() => clearTriggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            clearDialogRef.current?.close();
        }}
      >
        <div>
          <span className="confirmation-icon">
            <Trash2 size={22} aria-hidden="true" />
          </span>
          <h2 id="clear-title">Remove these snapshots?</h2>
          <p id="clear-description">
            This removes {projects.length} project snapshot
            {projects.length === 1 ? "" : "s"} from this browser. You can only
            restore them if you have a downloaded backup. Other tool drafts are
            not removed.
          </p>
          <div className="confirmation-actions">
            <button
              ref={cancelClearRef}
              type="button"
              onClick={() => clearDialogRef.current?.close()}
            >
              Keep snapshots
            </button>
            <button type="button" onClick={confirmClear}>
              Remove snapshots
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
