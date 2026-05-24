"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParkingTimer } from "@/hooks/useParkingTimer";
import { formatETB } from "@/lib/utils";

interface Props {
  startTime: string;
  extendedMinutes?: number;
  labels: {
    duration: string;
    currentCost: string;
    spot: string;
    started: string;
    floor: string;
    sessionId: string;
  };
  spotName: string;
  floor: number;
  qrSessionId: string;
}

export function ParkingTimer({
  startTime,
  extendedMinutes = 0,
  labels,
  spotName,
  floor,
  qrSessionId,
}: Props) {
  const { formatted, estimate } = useParkingTimer(startTime, extendedMinutes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.duration}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-mono text-4xl font-bold tracking-wider text-emerald-600 md:text-5xl">
          {formatted}
        </p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{labels.spot}</dt>
            <dd className="text-lg font-semibold">{spotName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.floor}</dt>
            <dd className="font-semibold">{floor}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.started}</dt>
            <dd>{new Date(startTime).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.sessionId}</dt>
            <dd className="font-mono text-xs">{qrSessionId}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">{labels.currentCost}</dt>
            <dd className="text-2xl font-bold text-emerald-600">{formatETB(estimate)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
