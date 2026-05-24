"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  Smartphone,
  Building2,
  CreditCard,
  Banknote,
  Wallet,
} from "lucide-react";

const icons: Record<PaymentMethod, React.ElementType> = {
  telebirr: Smartphone,
  cbe_birr: Building2,
  chapa: Wallet,
  cash: Banknote,
  card: CreditCard,
};

interface Props {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: Props) {
  const t = useTranslations("payment");

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label={t("selectMethod")}
    >
      {PAYMENT_METHODS.map((method) => {
        const Icon = icons[method];
        const isSelected = selected === method;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(method)}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors",
              isSelected
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-border hover:border-emerald-300"
            )}
          >
            <Icon className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
            {t(method)}
          </button>
        );
      })}
    </div>
  );
}
