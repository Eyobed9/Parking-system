"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "am" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={t("language")}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {locale === "en" ? "አማ" : "EN"}
    </Button>
  );
}
