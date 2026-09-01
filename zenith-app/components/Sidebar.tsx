"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Home,
  Landmark,
  LayoutGrid,
  Plus,
  ScanLine,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { workspaceDestinations } from "@/lib/workspaceNavigation";

const icons = {
  overview: LayoutGrid,
  feasibility: Activity,
  investment: BarChart3,
  policy: Landmark,
  rooftop: ScanLine,
  energy: Zap,
};

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="studio workspace-sidebar">
      <div className="sidebar-workspace">
        <span>
          <Home size={19} aria-hidden="true" />
        </span>
        <div>
          <strong>Solar workspace</strong>
          <small>Private beta</small>
        </div>
        <span className="sidebar-beta-dot" aria-hidden="true" />
      </div>
      <Link href="/service1?new=1" className="sidebar-new-project">
        <Plus size={16} aria-hidden="true" />
        New project
      </Link>
      <p className="sidebar-section-label">YOUR STUDIO</p>
      <nav aria-label="Workspace tools">
        {workspaceDestinations.map((item, index) => {
          const Icon = icons[item.key];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={active ? "sidebar-link-active" : ""}
            >
              <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.label}</span>
              {index > 0 && <small>0{index}</small>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/watch-demo" className="sidebar-walkthrough">
          <BookOpen size={17} aria-hidden="true" />
          <span>A guided walkthrough</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <div className="sidebar-integrity">
          <ShieldCheck size={17} aria-hidden="true" />
          <strong>Context over certainty.</strong>
          <p>Inputs stay visible. Policy and site checks stay explicit.</p>
          <Link href="/disclaimer">
            Read the model limits
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <p className="sidebar-local-note">
          Project snapshots are saved on this device. Keep a backup.
        </p>
      </div>
    </aside>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace tools" className="studio mobile-workspace-nav">
      {workspaceDestinations.map((item) => {
        const Icon = icons[item.key];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            aria-label={item.label}
          >
            <Icon size={19} strokeWidth={1.65} aria-hidden="true" />
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
