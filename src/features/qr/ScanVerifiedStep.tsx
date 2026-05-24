"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function ScanVerifiedStep() {
  const t = useTranslations("entry");

  return (
    <motion.div
      key="verified"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-4 py-10 text-center"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        className="rounded-full bg-emerald-100 p-5 dark:bg-emerald-950/50"
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-600" aria-hidden />
      </motion.div>
      <div className="space-y-1">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-emerald-700 dark:text-emerald-400"
        >
          {t("scanVerified")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          {t("choosingSpot")}
        </motion.p>
      </div>
    </motion.div>
  );
}
