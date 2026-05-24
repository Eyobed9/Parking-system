"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, MapPin, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ParkingReservation } from "@/types";
import {
  formatReservationCountdown,
  getReservationTimeLeftMs,
  isReservationActive,
} from "@/services/reservationService";

interface Props {
  reservation: ParkingReservation;
  onCancel: () => void;
}

export function ActiveReservationCard({ reservation, onCancel }: Props) {
  const t = useTranslations("reserve");
  const ts = useTranslations("session");
  const [timeLeft, setTimeLeft] = useState(() => getReservationTimeLeftMs(reservation));

  useEffect(() => {
    const tick = () => setTimeLeft(getReservationTimeLeftMs(reservation));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [reservation]);

  if (!isReservationActive(reservation)) return null;

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" aria-hidden />
          {t("activeTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
          <MapPin className="h-8 w-8 text-amber-600" aria-hidden />
          <div>
            <p className="text-2xl font-bold">{reservation.spotName}</p>
            <p className="text-sm text-muted-foreground">
              {ts("floor")} {reservation.floor}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">{t("holdDuration", { minutes: reservation.holdMinutes })}</Badge>
          <Badge variant="outline">
            {t("expiresIn")} {formatReservationCountdown(timeLeft)}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{t("scanToStart")}</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/scan-entry" className="flex-1">
            <Button size="lg" className="w-full">
              <QrCode className="h-5 w-5" aria-hidden />
              {t("scanEntry")}
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="flex-1" onClick={onCancel}>
            {t("cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
