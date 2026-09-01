import type { Metadata } from "next";
import WorkspaceOverview from "@/components/studio/WorkspaceOverview";

export const metadata: Metadata = {
  title: "Decision workspace",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <WorkspaceOverview />;
}
