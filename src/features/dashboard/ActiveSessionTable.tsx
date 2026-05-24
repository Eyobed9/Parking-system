import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParkingSession } from "@/types";

interface Props {
  title: string;
  sessions: ParkingSession[];
  labels: { floor: string; spot: string; started: string };
}

export function ActiveSessionTable({ title, sessions, labels }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm" aria-label={title}>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">{labels.spot}</th>
              <th className="pb-2 pr-4 font-medium">{labels.floor}</th>
              <th className="pb-2 font-medium">{labels.started}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 10).map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="py-3 pr-4 font-medium">
                  <Link href="/session" className="text-emerald-600 hover:underline">
                    {s.spotName}
                  </Link>
                </td>
                <td className="py-3 pr-4">{s.floor}</td>
                <td className="py-3 text-muted-foreground">
                  {new Date(s.startTime).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
