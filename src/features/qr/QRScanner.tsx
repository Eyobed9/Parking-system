"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface QRScannerProps {
  onScan: (decoded: string) => void;
  simulateLabel: string;
  simulateToken: string;
}

export function QRScanner({ onScan, simulateLabel, simulateToken }: QRScannerProps) {
  const t = useTranslations("entry");
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || typeof window === "undefined") return;
    started.current = true;

    let mounted = true;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length || !mounted) return;

        await scanner.start(
          cameras[0].id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => {
            onScan(text);
            void scanner.stop();
          },
          () => {}
        );
      } catch {
        setError(null);
      }
    }

    void start();

    return () => {
      mounted = false;
      void scannerRef.current?.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        className="mx-auto min-h-[200px] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted"
        aria-label={t("scanQR")}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => onScan(simulateToken)}
      >
        {simulateLabel}
      </Button>
    </div>
  );
}
