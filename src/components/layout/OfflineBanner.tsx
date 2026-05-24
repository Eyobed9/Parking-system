"use client";

import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";
import { useOfflineStore } from "@/store/useOfflineStore";

export function OfflineBanner() {
  const t = useTranslations("common");
  const isOnline = useOfflineStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      {t("offline")}
    </div>
  );
}
