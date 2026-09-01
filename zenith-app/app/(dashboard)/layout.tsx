import Sidebar, { MobileDashboardNav } from "@/components/Sidebar";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionPromise = getAuthSession();

  return (
    <DashboardContent sessionPromise={sessionPromise}>
      {children}
    </DashboardContent>
  );
}

async function DashboardContent({
  children,
  sessionPromise,
}: {
  children: React.ReactNode;
  sessionPromise: ReturnType<typeof getAuthSession>;
}) {
  const session = await sessionPromise;
  if (!session) redirect("/login");

  return (
    <div className="studio workspace-frame">
      <div className="workspace-layout">
        {/* FIXED SIDEBAR */}
        <div className="workspace-sidebar-wrap">
          <Sidebar />
        </div>
        <MobileDashboardNav />

        {/* SCROLLABLE MAIN CONTENT */}
        <main id="main-content" className="workspace-main">
          <div className="workspace-main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
