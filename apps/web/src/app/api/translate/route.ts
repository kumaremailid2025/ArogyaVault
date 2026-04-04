/**
 * GET /api/translate?text=...&from=hi-IN
 *
 * Server-side proxy to the Google Translate public endpoint.
 * Running this server-side avoids CORS issues and keeps the
 * translation logic off the client bundle.
 *
 * Returns: { translated: string; original: string }
 */
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const text = request.nextUrl.searchParams.get("text") ?? "";
  const from = request.nextUrl.searchParams.get("from") ?? "en-IN";

  // Nothing to do for empty strings or English
  if (!text.trim() || from === "en-IN" || from.startsWith("en")) {
    return NextResponse.json({ translated: text, original: text });
  }

  // Strip country suffix: "hi-IN" → "hi", "te-IN" → "te"
  const sl = from.split("-")[0];

  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", sl);
    url.searchParams.set("tl", "en");
    url.searchParams.set("dt",  "t");
    url.searchParams.set("q",   text);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
      // 8-second timeout so the voice flow never hangs
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`translate ${res.status}`);

    // Response shape: [ [ ["translated","original",…], … ], … ]
    const data = await res.json() as [[string, string][]][];
    const translated = data[0]
      .map(([t]) => t ?? "")
      .join("")
      .trim();

    return NextResponse.json({
      translated: translated || text,
      original: text,
    });
  } catch {
    // Graceful fallback: return the original transcript unchanged
    return NextResponse.json({ translated: text, original: text });
  }
};
