"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSessionStore } from "@/store/useSessionStore";
import { ParkingTimer } from "@/features/parking/ParkingTimer";
import { Button } from "@/components/ui/button";
import { MapPin, Timer, LogOut } from "lucide-react";

export default function SessionPage() {
  const t = useTranslations("session");
  const th = useTranslations("home");
  const router = useRouter();
  const activeSession = useSessionStore((s) => s.activeSession);
  const extendSession = useSessionStore((s) => s.extendSession);

  if (!activeSession) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("noSession")}</p>
        <Link href="/scan-entry">
          <Button size="lg">{th("startParking")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <ParkingTimer
        billingStartTime={activeSession.billingStartTime}
        waitingForArrival={!activeSession.billingStartTime}
        extendedMinutes={activeSession.extendedMinutes}
        spotName={activeSession.spotName}
        floor={activeSession.floor}
        qrSessionId={activeSession.qrSessionId}
        labels={{
          duration: t("duration"),
          currentCost: t("currentCost"),
          spot: t("spot"),
          started: t("started"),
          floor: t("floor"),
          sessionId: t("sessionId"),
          waiting: t("timerWaiting"),
        }}
      />

      <div className="flex flex-col gap-2">
        <Link href={`/map?navigate=1&floor=${activeSession.floor}`}>
          <Button variant="outline" size="lg" className="w-full">
            <MapPin className="h-5 w-5" aria-hidden />
            {t("navigate")}
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => {
            extendSession();
            toast.success(t("extended"));
          }}
        >
          <Timer className="h-5 w-5" aria-hidden />
          {t("extend")}
        </Button>
        <Link href="/map">
          <Button variant="outline" size="lg" className="w-full">
            {t("changeSpot")}
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={() => router.push("/scan-exit")}
        >
          <LogOut className="h-5 w-5" aria-hidden />
          {t("endParking")}
        </Button>
      </div>
    </div>
  );
}
