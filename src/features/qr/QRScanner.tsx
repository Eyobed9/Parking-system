"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getBackCameraConfig } from "@/lib/qr-camera";
import { RotateCcw } from "lucide-react";

interface QRScannerProps {
  onScan: (decoded: string) => boolean | Promise<boolean>;
  simulateLabel: string;
  simulateToken: string;
  invalidMessage?: string;
}

export function QRScanner({
  onScan,
  simulateLabel,
  simulateToken,
  invalidMessage,
}: QRScannerProps) {
  const t = useTranslations("entry");
  const readerId = useId().replace(/:/g, "");
  const [scanSession, setScanSession] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const onScanRef = useRef(onScan);
  const lastDecodedRef = useRef<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    try {
      await scanner.stop();
    } catch {
      /* already stopped */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const startScan = useCallback(() => {
    lastDecodedRef.current = null;
    setScanSession((n) => n + 1);
    setError(null);
    setLastScanned(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setIsScanning(true);
      setError(null);

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;

        const cameraConfig = await getBackCameraConfig();
        if (!mounted) return;

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.75;
              return { width: Math.floor(size), height: Math.floor(size) };
            },
            disableFlip: false,
          },
          async (text) => {
            const trimmed = text.trim();
            if (!trimmed || trimmed === lastDecodedRef.current) return;
            lastDecodedRef.current = trimmed;

            const accepted = await onScanRef.current(trimmed);
            if (!mounted) return;

            await stopScanner();

            if (accepted) {
              setIsScanning(false);
              setLastScanned(null);
            } else {
              lastDecodedRef.current = null;
              setLastScanned(trimmed);
              setError(invalidMessage ?? t("invalidQR"));
              setIsScanning(false);
            }
          },
          () => {}
        );
      } catch {
        if (!mounted) return;
        await stopScanner();
        setError(t("cameraError"));
        setIsScanning(false);
      }
    }

    void run();
    return () => {
      mounted = false;
      void stopScanner();
    };
  }, [scanSession, readerId, stopScanner, invalidMessage, t]);

  const handleSimulate = async () => {
    await stopScanner();
    setIsScanning(false);
    lastDecodedRef.current = null;
    const accepted = await onScanRef.current(simulateToken);
    if (!accepted) setError(invalidMessage ?? t("invalidQR"));
  };

  return (
    <div className="space-y-4">
      <div
        id={readerId}
        className="mx-auto min-h-[260px] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted"
        aria-label={t("scanQR")}
        aria-live="polite"
      />

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          <p>{error}</p>
          {lastScanned ? (
            <p className="mt-1 font-mono text-xs opacity-90">
              {t("scannedValue", { value: lastScanned.slice(0, 80) })}
            </p>
          ) : null}
        </div>
      ) : null}

      {error && !isScanning ? (
        <Button type="button" size="lg" className="w-full" onClick={startScan} aria-label={t("scanAgain")}>
          <RotateCcw className="h-5 w-5" aria-hidden />
          {t("scanAgain")}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleSimulate}
        disabled={isScanning}
      >
        {simulateLabel}
      </Button>
    </div>
  );
}
