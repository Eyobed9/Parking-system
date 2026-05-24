import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationHuman, formatETB } from "@/lib/utils";
import type { PriceBreakdown } from "@/types";

interface Props {
  title: string;
  breakdown: PriceBreakdown;
  labels: {
    duration: string;
    pricePerHour: string;
    subtotal: string;
    vat: string;
    serviceFee: string;
    total: string;
    peakSurcharge: string;
  };
}

export function PaymentSummary({ title, breakdown, labels }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{labels.duration}</dt>
            <dd className="font-medium">{formatDurationHuman(breakdown.durationMs)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{labels.pricePerHour}</dt>
            <dd>{formatETB(breakdown.ratePerHour)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{labels.subtotal}</dt>
            <dd>{formatETB(breakdown.subtotal)}</dd>
          </div>
          {breakdown.isPeak && (
            <div className="flex justify-between text-amber-600">
              <dt>{labels.peakSurcharge}</dt>
              <dd>+{formatETB(breakdown.peakSurcharge)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{labels.vat}</dt>
            <dd>{formatETB(breakdown.vat)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{labels.serviceFee}</dt>
            <dd>{formatETB(breakdown.serviceFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
            <dt>{labels.total}</dt>
            <dd className="text-emerald-600">{formatETB(breakdown.total)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
