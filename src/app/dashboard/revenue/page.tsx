"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParkingStore } from "@/store/useParkingStore";
import { StatsCard } from "@/features/dashboard/StatsCard";
import { formatETB } from "@/lib/utils";
import { DollarSign } from "lucide-react";

const RevenueChart = dynamic(
  () => import("@/features/dashboard/RevenueChart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-2xl bg-muted" /> }
);

export default function RevenuePage() {
  const t = useTranslations("dashboard");
  const revenueData = useParkingStore((s) => s.revenueData);
  const todayRevenue = useParkingStore((s) => s.todayRevenue);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("revenue")}</h1>
      <StatsCard
        title={t("todayRevenue")}
        value={formatETB(todayRevenue)}
        icon={DollarSign}
        className="max-w-sm"
      />
      <RevenueChart title={t("revenue")} data={revenueData} />
    </div>
  );
}
