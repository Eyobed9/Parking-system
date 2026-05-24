/**
 * Normalize raw QR decode output so printed codes match demo tokens reliably.
 */
export function normalizeQrPayload(raw: string): string {
  let s = raw
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\0/g, "")
    .trim();

  // Normalize Unicode dashes to ASCII hyphen (common copy/paste / font issue).
  s = s.replace(/[\u2010-\u2015\u2212]/g, "-");

  // Strip surrounding quotes.
  s = s.replace(/^["'`]+|["'`]+$/g, "").trim();

  // If the QR encodes a URL, use token query param or last path segment.
  if (/^https?:\/\//i.test(s)) {
    try {
      const url = new URL(s);
      const tokenParam = url.searchParams.get("token");
      if (tokenParam) {
        s = tokenParam;
      } else {
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length > 0) {
          s = segments[segments.length - 1];
        }
      }
    } catch {
      /* keep original string */
    }
  }

  return s.trim().toLowerCase();
}

/** True if normalized payload is the given demo token (exact or embedded). */
export function payloadMatchesToken(normalized: string, token: string): boolean {
  if (normalized === token) return true;
  if (normalized.includes(token)) return true;

  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withDashVariants = escaped.replace("-", "[\\u2010-\\u2015\\u2212-]?");
  const re = new RegExp(`(?:^|[/?#&=\\s])${withDashVariants}(?:$|[/?#&\\s])`);

  return re.test(normalized);
}
