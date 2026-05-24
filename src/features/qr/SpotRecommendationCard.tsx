"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RecommendationResult } from "@/types";
import { MapPin, Star } from "lucide-react";

interface Props {
  recommendation: RecommendationResult;
  onAccept: () => void;
  onChooseMap: () => void;
  onSelectAlternative: (spotId: string) => void;
}

export function SpotRecommendationCard({
  recommendation,
  onAccept,
  onChooseMap,
  onSelectAlternative,
}: Props) {
  const t = useTranslations("entry");
  const ts = useTranslations("session");

  const reasonLabels: Record<string, string> = {
    preferredFloor: t("reasonPreferred"),
    nearestAvailable: t("reasonNearest"),
    nearExit: t("reasonExit"),
  };

  return (
    <Card className="border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-emerald-600" aria-hidden />
          {t("recommended")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <MapPin className="h-8 w-8 text-emerald-600" aria-hidden />
          <div>
            <p className="text-3xl font-bold">{recommendation.recommended.name}</p>
            <p className="text-sm text-muted-foreground">
              {ts("floor")} {recommendation.recommended.floor}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendation.reasons.map((r) => (
            <Badge key={r} variant="default">
              {reasonLabels[r] ?? r}
            </Badge>
          ))}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("alternatives")}</p>
          <div className="flex flex-wrap gap-2">
            {recommendation.alternatives.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                onClick={() => onSelectAlternative(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={onAccept}>
            {t("useRecommended")}
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={onChooseMap}>
            {t("chooseOnMap")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
