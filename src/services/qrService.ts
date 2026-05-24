import { QR_TOKENS } from "@/lib/constants";
import { cacheQRTokens, getCachedQRTokens } from "@/lib/idb";
import type { QRToken } from "@/types";

const VALID_TOKENS: QRToken[] = [
  { token: QR_TOKENS.ENTRY, type: "entry" },
  { token: QR_TOKENS.EXIT, type: "exit" },
];

export async function initQRCache(): Promise<void> {
  await cacheQRTokens(VALID_TOKENS.map((t) => t.token));
}

export async function validateQRToken(
  scanned: string
): Promise<QRToken | null> {
  const normalized = scanned.trim().toLowerCase();
  const match = VALID_TOKENS.find(
    (t) => t.token.toLowerCase() === normalized
  );
  if (match) return match;

  const cached = await getCachedQRTokens();
  const cachedMatch = cached.find((t) => t.toLowerCase() === normalized);
  if (cachedMatch === QR_TOKENS.ENTRY) return { token: cachedMatch, type: "entry" };
  if (cachedMatch === QR_TOKENS.EXIT) return { token: cachedMatch, type: "exit" };
  return null;
}
