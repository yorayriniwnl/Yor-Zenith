"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Landmark,
  Home,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/service1", label: "The Payback Pulse", icon: Activity },
  { href: "/service2", label: "The 20 Year Vision", icon: BarChart3 },
  { href: "/service3", label: "The Subsidy Scout", icon: Landmark },
  { href: "/service4", label: "The Photon Hunter", icon: Home },
  { href: "/service5", label: "The Grid Guardian", icon: Zap, aliases: ["/lumen"] },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full w-[22rem] flex-col overflow-hidden border-r border-cyan-500/12 bg-[#041019] px-7 py-11 shadow-[inset_-1px_0_0_rgba(12,42,54,0.9)]">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

      <h2 className="mb-8 px-1 text-[0.95rem] font-medium uppercase tracking-[0.08em] text-[#c0b8ab]">
        Command Center
      </h2>

      <nav className="relative flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon, aliases }) => {
          const active = pathname === href || aliases?.includes(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`
                group relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-5
                transition-all duration-200
                ${active
                  ? "bg-[#0a3341] text-[#29ddff] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  : "text-[#d4d0c9] hover:bg-white/[0.025] hover:text-white"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-[#20dfff] shadow-[0_0_14px_rgba(32,223,255,0.45)]" />
              )}

              <Icon
                size={22}
                strokeWidth={1.9}
                className={`
                  relative shrink-0 transition-colors duration-200
                  ${active ? "text-[#29ddff]" : "text-[#c8c3bc]/90 group-hover:text-white"}
                `}
              />
              <span className={`
                relative text-[1.04rem] font-medium tracking-[-0.01em]
                ${active ? "text-[#29ddff]" : ""}
              `}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
