"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  QrCode,
  Map,
  Timer,
  LogOut,
  Home,
  BarChart3,
  Grid3x3,
} from "lucide-react";

const mainLinks = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/scan-entry", icon: QrCode, key: "scanEntry" as const },
  { href: "/map", icon: Map, key: "map" as const },
  { href: "/session", icon: Timer, key: "session" as const },
  { href: "/scan-exit", icon: LogOut, key: "scanExit" as const },
];

const dashLinks = [
  { href: "/dashboard/sessions", icon: Timer, label: "sessions" },
  { href: "/dashboard/spots", icon: Grid3x3, label: "spots" },
  { href: "/dashboard/revenue", icon: BarChart3, label: "revenue" },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const td = useTranslations("dashboard");

  return (
    <aside
      className="hidden w-56 shrink-0 border-r border-border bg-card md:block"
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col gap-1 p-4">
        {mainLinks.map(({ href, icon: Icon, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {t(key)}
            </Link>
          );
        })}
        <div className="my-2 border-t border-border" />
        {dashLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {td(label === "sessions" ? "activeSessionsTable" : label === "spots" ? "spotsView" : "revenue")}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
