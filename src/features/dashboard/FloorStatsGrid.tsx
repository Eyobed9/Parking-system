import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FloorStats } from "@/types";

interface Props {
  title: string;
  floors: FloorStats[];
  floorLabel: string;
}

export function FloorStatsGrid({ title, floors, floorLabel }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {floors.map((f) => (
            <div
              key={f.floor}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <p className="mb-2 font-semibold">
                {floorLabel} {f.floor}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{f.free} free</Badge>
                <Badge variant="destructive">{f.occupied} occ.</Badge>
                <Badge variant="warning">{f.reserved} res.</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
