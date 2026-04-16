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
  { href: "/service1", label: "The Payback Pulse",   icon: Activity },
  { href: "/service2", label: "The 20 Year Vision",  icon: BarChart3 },
  { href: "/service3", label: "The Subsidy Scout",   icon: Landmark  },
  { href: "/service4", label: "The Photon Hunter",   icon: Home      },
  { href: "/service5", label: "The Grid Guardian",   icon: Zap       },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="
      w-64 h-screen
      bg-[#020B10]
      border-r border-[#5F9598]/20
      px-5 py-8
      flex flex-col
      relative overflow-hidden
    ">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-10 w-56 h-56 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl" />

      <h2 className="
        relative text-[10px] uppercase tracking-[0.22em]
        text-[#F3F4F4]/40 mb-7 px-1 font-semibold
        after:block after:mt-3 after:h-px after:w-full
        after:bg-gradient-to-r after:from-cyan-500/30 after:via-white/10 after:to-transparent
      ">
        Command Center
      </h2>

      <nav className="relative flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 overflow-hidden
                ${active
                  ? "bg-gradient-to-r from-cyan-500/15 to-emerald-500/5 text-cyan-300"
                  : "text-[#F3F4F4]/55 hover:text-[#F3F4F4]/90 hover:bg-white/[0.04]"
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="
                  absolute left-0 top-1/2 -translate-y-1/2
                  h-[60%] w-[3px] rounded-r-full
                  bg-gradient-to-b from-cyan-400 to-emerald-400
                  shadow-[0_0_8px_rgba(34,211,238,0.7)]
                " />
              )}

              {/* Hover shimmer */}
              <span className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                bg-gradient-to-r from-transparent via-white/[0.02] to-transparent
              " />

              <Icon
                size={16}
                className={`
                  relative shrink-0 transition-colors duration-200
                  ${active ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "text-[#F3F4F4]/35 group-hover:text-[#F3F4F4]/70"}
                `}
              />
              <span className={`
                relative text-[13px] font-medium tracking-[0.01em]
                ${active ? "text-cyan-200" : ""}
              `}>
                {label}
              </span>

              {/* NEW badge for service 5 */}
              {href === "/service5" && !active && (
                <span className="
                  relative ml-auto text-[9px] font-bold uppercase tracking-wider
                  px-1.5 py-0.5 rounded-full
                  bg-emerald-500/15 border border-emerald-500/30 text-emerald-400
                ">
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom version tag */}
      <div className="relative mt-auto pt-6 px-1">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
        <p className="text-[10px] font-mono text-white/20 tracking-widest">ZENITH v1.0</p>
      </div>
    </aside>
  );
}