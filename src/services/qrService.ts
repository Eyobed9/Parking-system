import { QR_TOKENS } from "@/lib/constants";
import { normalizeQrPayload, payloadMatchesToken } from "@/lib/qr-normalize";
import { cacheQRTokens, getCachedQRTokens } from "@/lib/idb";
import type { QRToken } from "@/types";

const VALID_TOKENS: QRToken[] = [
  { token: QR_TOKENS.ENTRY, type: "entry" },
  { token: QR_TOKENS.EXIT, type: "exit" },
];

export async function initQRCache(): Promise<void> {
  await cacheQRTokens(VALID_TOKENS.map((t) => t.token));
}

function resolveToken(normalized: string): QRToken | null {
  for (const valid of VALID_TOKENS) {
    if (payloadMatchesToken(normalized, valid.token)) {
      return valid;
    }
  }
  return null;
}

export async function validateQRToken(
  scanned: string
): Promise<QRToken | null> {
  const normalized = normalizeQrPayload(scanned);
  if (!normalized) return null;

  const match = resolveToken(normalized);
  if (match) return match;

  // Offline: accept cached token list with same normalization rules.
  const cached = await getCachedQRTokens();
  for (const cachedToken of cached) {
    const normCached = normalizeQrPayload(cachedToken);
    if (payloadMatchesToken(normalized, normCached)) {
      if (normCached === QR_TOKENS.ENTRY || cachedToken === QR_TOKENS.ENTRY) {
        return { token: QR_TOKENS.ENTRY, type: "entry" };
      }
      if (normCached === QR_TOKENS.EXIT || cachedToken === QR_TOKENS.EXIT) {
        return { token: QR_TOKENS.EXIT, type: "exit" };
      }
    }
  }

  return null;
}
