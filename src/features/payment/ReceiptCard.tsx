import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatETB } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Props {
  title: string;
  thankYou: string;
  spotName: string;
  amount: number;
  method: string;
  transactionId: string;
  paidWithLabel: string;
  transactionLabel: string;
}

export function ReceiptCard({
  title,
  thankYou,
  spotName,
  amount,
  method,
  transactionId,
  paidWithLabel,
  transactionLabel,
}: Props) {
  return (
    <Card className="mx-auto max-w-md border-emerald-200 print:shadow-none">
      <CardHeader className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
        <CardTitle className="mt-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{thankYou}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-center">
        <p className="text-3xl font-bold">{formatETB(amount)}</p>
        <p className="text-lg font-medium">{spotName}</p>
        <p className="text-sm text-muted-foreground">
          {paidWithLabel}: <span className="font-medium text-foreground">{method}</span>
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {transactionLabel}: {transactionId}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
