"use client";

import { useTranslations } from "next-intl";
import { useParkingStore } from "@/store/useParkingStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpotsPage() {
  const t = useTranslations("dashboard");
  const spots = useParkingStore((s) => s.spots);

  const statusVariant = {
    free: "default" as const,
    occupied: "destructive" as const,
    reserved: "warning" as const,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("spotsView")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("totalSpots")}: {spots.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {spots.map((s) => (
              <li
                key={s.id}
                className="flex flex-col items-center rounded-lg border border-border p-2 text-center text-xs"
              >
                <span className="font-semibold">{s.name}</span>
                <Badge variant={statusVariant[s.status]} className="mt-1">
                  {s.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
