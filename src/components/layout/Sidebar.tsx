"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/useSessionStore";
import {
  LayoutDashboard,
  QrCode,
  Map,
  Timer,
  LogOut,
  Home,
  Grid3x3,
  CalendarClock,
} from "lucide-react";

const staticMainLinks = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/session", icon: Timer, key: "session" as const },
  { href: "/map", icon: Map, key: "map" as const },
] as const;

const dashLinks = [
  { href: "/dashboard/sessions", icon: Timer, labelKey: "activeSessionsTable" as const },
  { href: "/dashboard/spots", icon: Grid3x3, labelKey: "spotsView" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const td = useTranslations("dashboard");
  const activeSession = useSessionStore((s) => s.activeSession);

  const scanLink = activeSession
    ? ({ href: "/scan-exit", icon: LogOut, key: "scanExit" } as const)
    : ({ href: "/scan-entry", icon: QrCode, key: "scanEntry" } as const);

  const mainLinks = activeSession
    ? [
        staticMainLinks[0],
        staticMainLinks[1],
        staticMainLinks[2],
        staticMainLinks[3],
        scanLink,
      ]
    : [
        staticMainLinks[0],
        staticMainLinks[1],
        { href: "/reserve", icon: CalendarClock, key: "reserve" as const },
        staticMainLinks[2],
        staticMainLinks[3],
        scanLink,
      ];

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
        {dashLinks.map(({ href, icon: Icon, labelKey }) => (
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
            {td(labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
