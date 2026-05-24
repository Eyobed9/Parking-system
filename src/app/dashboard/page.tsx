"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { getDashboardStats, getFloorStats } from "@/services/spotService";
import { StatsCard } from "@/features/dashboard/StatsCard";
import { FloorStatsGrid } from "@/features/dashboard/FloorStatsGrid";
import { ActiveSessionTable } from "@/features/dashboard/ActiveSessionTable";
import { PeakHoursBadge } from "@/features/dashboard/PeakHoursBadge";
import { formatETB } from "@/lib/utils";
import {
  Car,
  CircleParking,
  CircleDot,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";

const ParkingAvailabilityChart = dynamic(
  () =>
    import("@/features/dashboard/ParkingAvailabilityChart").then(
      (m) => m.ParkingAvailabilityChart
    ),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" /> }
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const spots = useParkingStore((s) => s.spots);
  const todayRevenue = useParkingStore((s) => s.todayRevenue);
  const mockSessions = useSessionStore((s) => s.mockSessions);
  const activeSession = useSessionStore((s) => s.activeSession);

  const sessions = activeSession
    ? [activeSession, ...mockSessions.filter((s) => s.id !== activeSession.id)]
    : mockSessions;

  const stats = getDashboardStats(spots, sessions.length, todayRevenue);
  const floors = getFloorStats(spots);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>

      <PeakHoursBadge label={t("peakHours")} value={t("peakHoursValue")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title={t("totalSpots")} value={stats.totalSpots} icon={CircleParking} />
        <StatsCard title={t("occupied")} value={stats.occupied} icon={Users} accent="red" />
        <StatsCard title={t("freeSpots")} value={stats.free} icon={CircleDot} accent="green" />
        <StatsCard title={t("reserved")} value={stats.reserved} accent="amber" />
        <StatsCard
          title={t("pricePerHour")}
          value={formatETB(stats.pricePerHour)}
          icon={Clock}
        />
        <StatsCard title={t("activeSessions")} value={stats.activeSessions} icon={Car} accent="blue" />
        <StatsCard
          title={t("todayRevenue")}
          value={formatETB(stats.todayRevenue)}
          icon={DollarSign}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ParkingAvailabilityChart
          title={t("availability")}
          free={stats.free}
          occupied={stats.occupied}
          reserved={stats.reserved}
          labels={{
            free: t("freeSpots"),
            occupied: t("occupied"),
            reserved: t("reserved"),
          }}
        />
        <FloorStatsGrid title={t("floorStats")} floors={floors} floorLabel={t("floor")} />
      </div>

      <ActiveSessionTable
        title={t("activeSessionsTable")}
        sessions={sessions}
        labels={{ floor: t("floor"), spot: t("spot"), started: t("started") }}
      />
    </div>
  );
}
