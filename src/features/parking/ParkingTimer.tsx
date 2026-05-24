"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParkingTimer } from "@/hooks/useParkingTimer";
import { formatETB } from "@/lib/utils";

interface Props {
  /** Billing / parking duration anchor — set when user reaches the spot */
  billingStartTime?: string;
  extendedMinutes?: number;
  waitingForArrival?: boolean;
  labels: {
    duration: string;
    currentCost: string;
    spot: string;
    started: string;
    floor: string;
    sessionId: string;
    waiting?: string;
  };
  spotName: string;
  floor: number;
  qrSessionId: string;
}

export function ParkingTimer({
  billingStartTime,
  extendedMinutes = 0,
  waitingForArrival = false,
  labels,
  spotName,
  floor,
  qrSessionId,
}: Props) {
  const { formatted, estimate } = useParkingTimer(billingStartTime, extendedMinutes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.duration}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {waitingForArrival ? (
          <p className="text-sm text-muted-foreground">{labels.waiting}</p>
        ) : null}
        <p className="font-mono text-4xl font-bold tracking-wider text-emerald-600 md:text-5xl">
          {billingStartTime ? formatted : "00:00:00"}
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
            <dd>
              {billingStartTime
                ? new Date(billingStartTime).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.sessionId}</dt>
            <dd className="font-mono text-xs">{qrSessionId}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">{labels.currentCost}</dt>
            <dd className="text-2xl font-bold text-emerald-600">
              {billingStartTime ? formatETB(estimate) : formatETB(0)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
