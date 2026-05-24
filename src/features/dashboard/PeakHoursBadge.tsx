import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Props {
  label: string;
  value: string;
}

export function PeakHoursBadge({ label, value }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <Clock className="h-5 w-5 text-amber-600" aria-hidden />
      <div>
        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{label}</p>
        <Badge variant="warning" className="mt-1">{value}</Badge>
      </div>
    </div>
  );
}
