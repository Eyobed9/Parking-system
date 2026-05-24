"use client";

import { useTranslations } from "next-intl";
import { useSessionStore } from "@/store/useSessionStore";
import { ActiveSessionTable } from "@/features/dashboard/ActiveSessionTable";

export default function SessionsPage() {
  const t = useTranslations("dashboard");
  const mockSessions = useSessionStore((s) => s.mockSessions);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("activeSessionsTable")}</h1>
      <ActiveSessionTable
        title={t("activeSessionsTable")}
        sessions={mockSessions}
        labels={{ floor: t("floor"), spot: t("spot"), started: t("started") }}
      />
    </div>
  );
}
