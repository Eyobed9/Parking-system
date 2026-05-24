"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStore } from "@/store/useSessionStore";
import { Car, LayoutDashboard, QrCode } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("home");
  const activeSession = useSessionStore((s) => s.activeSession);

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Car className="mx-auto h-16 w-16 text-emerald-600" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{t("welcome")}</h1>
      </motion.div>

      {activeSession && (
        <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{t("activeSession")} — {activeSession.spotName}</p>
            <Link href="/session">
              <Button>{t("continueSession")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Link href="/scan-entry" className="w-full">
          <Button size="lg" className="w-full">
            <QrCode className="h-5 w-5" aria-hidden />
            {t("startParking")}
          </Button>
        </Link>
        <Link href="/dashboard" className="w-full">
          <Button size="lg" variant="outline" className="w-full">
            <LayoutDashboard className="h-5 w-5" aria-hidden />
            {t("viewDashboard")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
