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
} from "lucide-react";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/scan-entry", icon: QrCode, key: "scanEntry" as const },
  { href: "/map", icon: Map, key: "map" as const },
  { href: "/session", icon: Timer, key: "session" as const },
  { href: "/scan-exit", icon: LogOut, key: "scanExit" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden"
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch justify-around px-1 py-1">
        {links.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-medium transition-colors",
                  active
                    ? "text-emerald-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
