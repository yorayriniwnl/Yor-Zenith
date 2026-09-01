export type ZenithProjectStatus = "draft" | "modeled" | "review-ready";

export type ZenithProject = {
  id: string;
  name: string;
  location: string;
  monthlyBill: number;
  tariffPerKWh: number;
  systemSizeKW: number;
  paybackYears: number | null;
  feasibilityScore: number;
  status: ZenithProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export const ZENITH_PROJECTS_STORAGE_KEY = "zenith.projects.v1";
export const ZENITH_PROJECTS_CHANGED_EVENT = "zenith-projects-changed";
export const ZENITH_PROJECTS_BACKUP_VERSION = 1;

function canUseStorage() {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

function isProjectStatus(value: unknown): value is ZenithProjectStatus {
  return value === "draft" || value === "modeled" || value === "review-ready";
}

function isFiniteNumber(
  value: unknown,
  min = -Infinity,
  max = Infinity,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function isBoundedText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isTimestamp(value: unknown): value is string {
  return isBoundedText(value, 80) && !Number.isNaN(Date.parse(value));
}

function isZenithProject(value: unknown): value is ZenithProject {
  if (!value || typeof value !== "object") return false;

  const project = value as Record<string, unknown>;
  return (
    isBoundedText(project.id, 120) &&
    isBoundedText(project.name, 160) &&
    isBoundedText(project.location, 120) &&
    isFiniteNumber(project.monthlyBill, 0.01, 10_000_000) &&
    isFiniteNumber(project.tariffPerKWh, 0.01, 1_000) &&
    isFiniteNumber(project.systemSizeKW, 0.01, 1_000) &&
    (project.paybackYears === null ||
      isFiniteNumber(project.paybackYears, 0, 100)) &&
    isFiniteNumber(project.feasibilityScore, 0, 10) &&
    isProjectStatus(project.status) &&
    isTimestamp(project.createdAt) &&
    isTimestamp(project.updatedAt)
  );
}

function writeProjects(projects: ZenithProject[]) {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(
      ZENITH_PROJECTS_STORAGE_KEY,
      JSON.stringify(projects),
    );
    window.dispatchEvent(new Event(ZENITH_PROJECTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function readZenithProjects(): ZenithProject[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(ZENITH_PROJECTS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isZenithProject)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch {
    return [];
  }
}

export function upsertZenithProject(
  project: Omit<ZenithProject, "id" | "createdAt" | "updatedAt"> &
    Partial<Pick<ZenithProject, "id" | "createdAt">>,
) {
  if (!canUseStorage()) return null;

  const existing = readZenithProjects();
  const now = new Date().toISOString();
  const previous = project.id
    ? existing.find((item) => item.id === project.id)
    : undefined;
  const saved: ZenithProject = {
    ...project,
    id: project.id ?? createZenithProjectId(),
    createdAt: project.createdAt ?? previous?.createdAt ?? now,
    updatedAt: now,
  };
  const next = [
    saved,
    ...existing.filter((item) => item.id !== saved.id),
  ].slice(0, 12);

  return writeProjects(next) ? saved : null;
}

export function createZenithProjectsBackup() {
  return JSON.stringify(
    {
      version: ZENITH_PROJECTS_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      projects: readZenithProjects(),
    },
    null,
    2,
  );
}

export function restoreZenithProjectsBackup(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new Error("Backup file must contain a JSON object.");
  }

  const backup = value as Record<string, unknown>;
  if (
    backup.version !== ZENITH_PROJECTS_BACKUP_VERSION ||
    !Array.isArray(backup.projects)
  ) {
    throw new Error("This backup format is not supported.");
  }

  const validProjects = backup.projects.filter(isZenithProject);
  if (!validProjects.length) {
    throw new Error(
      "This backup does not contain any valid project snapshots.",
    );
  }

  const incoming = new Map<string, ZenithProject>();
  for (const project of validProjects) {
    const previous = incoming.get(project.id);
    if (
      !previous ||
      Date.parse(project.updatedAt) > Date.parse(previous.updatedAt)
    )
      incoming.set(project.id, project);
  }

  const merged = new Map(
    readZenithProjects().map((project) => [project.id, project]),
  );
  let imported = 0;
  for (const project of [...incoming.values()].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  )) {
    const existing = merged.get(project.id);
    if (
      existing &&
      Date.parse(existing.updatedAt) >= Date.parse(project.updatedAt)
    )
      continue;
    if (!existing && merged.size >= 12) continue;
    merged.set(project.id, project);
    imported += 1;
  }

  // Keep existing snapshots at capacity, and never roll a project back to an older backup.
  if (
    imported > 0 &&
    !writeProjects(
      [...merged.values()].sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      ),
    )
  ) {
    throw new Error("The browser could not save the restored snapshots.");
  }

  return {
    imported,
    skipped: backup.projects.length - imported,
  };
}

export function clearZenithProjects() {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.removeItem(ZENITH_PROJECTS_STORAGE_KEY);
    window.dispatchEvent(new Event(ZENITH_PROJECTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function createZenithProjectId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
