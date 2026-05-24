import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
  accent?: "green" | "red" | "blue" | "amber" | "default";
}

const accents = {
  green: "border-l-4 border-l-emerald-500",
  red: "border-l-4 border-l-red-500",
  blue: "border-l-4 border-l-blue-500",
  amber: "border-l-4 border-l-amber-500",
  default: "",
};

export function StatsCard({ title, value, icon: Icon, className, accent = "default" }: StatsCardProps) {
  return (
    <Card className={cn(accents[accent], className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {title}
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}
